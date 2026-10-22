import React, { useEffect, useState } from 'react';
import { Check, ImagePlus, PackageSearch, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/product';
import { Button, Dialog, Field } from './ui';
import { categoryGroups } from '../../data/categoryHierarchy';
import { getSupplierStockView } from '../../services/productAdmin';

const productSlug = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const formatPrice = (value: number) => `${(Number.isFinite(value) ? value : 0).toFixed(2)}€`;

export function blankProduct(): Product {
  return { id: '', name: '', slug: '', sku: '', ean: '', manufacturerCode: '', shortDescription: '', fullDescription: '', brandId: '', categoryIds: [], price: 0, costPrice: 0, supplierStock: undefined, vatRate: .24, stockQuantity: 0, lowStockThreshold: 3, availabilityStatus: 'out_of_stock', unit: 'Τεμάχιο', packageQuantity: 1, images: [], attributes: {}, specifications: [], includedItems: [], compatibleProductIds: [], relatedProductIds: [], manualFiles: [], warranty: '', weight: 0, dimensions: { length: 0, width: 0, height: 0 }, seoTitle: '', seoDescription: '', active: false, publicationStatus: 'draft', featured: false, popular: false, rating: 0, reviewCount: 0, createdAt: '', updatedAt: '' };
}

type ProductEditorCategory = { id: string; name: string; groupName?: string };

function CategoryPicker({ selected, onChange, categories }: { selected: string[]; onChange: (value: string[]) => void; categories: ProductEditorCategory[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const visible = categories.filter(category => `${category.groupName ?? ''} ${category.name}`.toLocaleLowerCase('el').includes(search.toLocaleLowerCase('el')));
  return <div className="relative">
    <button type="button" className="nt-category-picker-trigger flex min-h-11 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm" onClick={() => setOpen(value => !value)}><span>{selected.length ? `${selected.length} κατηγορί${selected.length === 1 ? 'α' : 'ες'} επιλεγμέν${selected.length === 1 ? 'η' : 'ες'}` : 'Επιλέξτε κατηγορίες'}</span><span>⌄</span></button>
    {open && <><button type="button" aria-label="Κλείσιμο επιλογής κατηγοριών" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} /><div className="nt-category-picker-menu absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-white p-2 shadow-xl"><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Αναζήτηση κατηγορίας..." aria-label="Αναζήτηση κατηγορίας" className="nt-input mb-2" />{visible.length ? visible.map(category => <label key={category.id} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-red-50"><input type="checkbox" checked={selected.includes(category.id)} onChange={event => onChange(event.target.checked ? [...selected, category.id] : selected.filter(id => id !== category.id))} /><span>{category.groupName ? `${category.groupName} / ` : ''}{category.name}</span></label>) : <p className="px-2 py-3 text-sm text-neutral-500">Δεν βρέθηκε κατηγορία.</p>}</div></>}
  </div>;
}

type ProductEditorProps = {
  product: Product;
  onClose: () => void;
  onAdjustStock?: () => void;
  canViewPurchasePrice?: boolean;
  fullPage?: boolean;
};

export function ProductEditor({ product, onClose, onAdjustStock, canViewPurchasePrice = false, fullPage = true }: ProductEditorProps) {
  const { brands, categories, addProduct, updateProduct } = useStore();
  const [draft, setDraft] = useState<Product>(() => structuredClone(product));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const dirty = JSON.stringify(product) !== JSON.stringify(draft);
  const supplierStock = getSupplierStockView(draft);
  const supplierStockLabel = supplierStock.value === 'Μη διαθέσιμο' ? '-' : supplierStock.value;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const close = () => { if (!dirty || window.confirm('Υπάρχουν μη αποθηκευμένες αλλαγές. Θέλετε να τις απορρίψετε;')) onClose(); };
  const set = <K extends keyof Product,>(key: K, value: Product[K]) => setDraft(current => ({ ...current, [key]: value }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError('');
    try {
      for (const file of Array.from(files)) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Εικόνες JPG, PNG ή WebP έως 5 MB.');
        const image = await createImageBitmap(file);
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = image.width * scale; canvas.height = image.height * scale;
        canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
        image.close();
        const url = canvas.toDataURL('image/webp', .82);
        setDraft(current => ({ ...current, images: [...current.images, url] }));
      }
    } catch (uploadError) { setError((uploadError as Error).message); }
    finally { setBusy(false); }
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSaveStatus('saving');
    try {
      const value = { ...draft, slug: draft.slug || productSlug(draft.name) || `product-${Date.now()}`, active: draft.publicationStatus === 'published' };
      if (value.active && (!value.images.length || !value.categoryIds.length)) throw new Error('Για δημοσίευση χρειάζεται φωτογραφία και κατηγορία.');
      if (draft.id) updateProduct(draft.id, value); else addProduct(value);
      onClose();
    } catch (saveError) { setError((saveError as Error).message); setSaveStatus('error'); }
  };

  const productCategories = categoryGroups.flatMap(group => categories.filter(category => category.parentId === group.id).map(category => ({ id: category.id, name: category.name, groupName: `${group.name} / ${category.groupName ?? ''}` })));

  const sellingPriceExcludingVat = draft.price / (1 + draft.vatRate);
  const grossProfit = sellingPriceExcludingVat - draft.costPrice;

  return <Dialog title="" onClose={close} fullPage={fullPage} hideClose>
    <form onSubmit={save} className="nt-product-editor space-y-4 pb-24 sm:space-y-6 sm:pb-0">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="nt-product-overview space-y-4" aria-labelledby="product-identity-heading">
        <div className="nt-product-heading">
          <label className="nt-product-title-field"><span className="sr-only">Τίτλος *</span><textarea id="product-identity-heading" required rows={1} value={draft.name} onChange={event => set('name', event.target.value)} aria-label="Τίτλος προϊόντος" placeholder="Τίτλος προϊόντος" /></label>
          <label className="nt-product-sku"><span>Κωδικός προϊόντος:</span><input required value={draft.sku} onChange={event => set('sku', event.target.value)} autoCapitalize="off" aria-label="Κωδικός προϊόντος" /></label>
        </div>

        <div className={`nt-product-gallery ${draft.images.length > 1 ? 'has-thumbnails' : ''}`}>
          <div className="nt-main-product-image">
            {draft.images[0] ? <img src={draft.images[0]} alt={draft.imageAlt?.[draft.images[0]] ?? draft.name} /> : <div className="text-center text-neutral-400"><ImagePlus className="mx-auto mb-2" /><p className="text-sm">Προσθέστε φωτογραφία</p></div>}
          </div>
          {draft.images.length > 1 && <div className="nt-product-thumbnails" aria-label="Φωτογραφίες προϊόντος">
            {draft.images.slice(1).map((url, offset) => { const index = offset + 1; return <div key={url} className="nt-product-thumbnail-wrap"><button type="button" className="nt-product-thumbnail" title="Ορισμός ως κύρια" aria-label={`Ορισμός εικόνας ${index + 1} ως κύρια`} onClick={() => set('images', [url, ...draft.images.filter((_, imageIndex) => imageIndex !== index)])}><img src={url} alt="" /></button><button type="button" className="nt-thumbnail-remove" title="Αφαίρεση εικόνας" aria-label="Αφαίρεση εικόνας" onClick={() => set('images', draft.images.filter((_, imageIndex) => imageIndex !== index))}><Trash2 size={12} /></button></div>; })}
          </div>}
        </div>
        {busy && <p role="status" className="text-sm text-neutral-600">Επεξεργασία εικόνας…</p>}
      </section>

      <section className="space-y-4" aria-labelledby="operations-heading">
        <h3 id="operations-heading" className="sr-only">Τιμές & διαθεσιμότητα</h3>
        <div className={`nt-price-grid ${canViewPurchasePrice ? 'has-purchase-price' : ''}`}>
          {canViewPurchasePrice && <Field label="Τιμή αγοράς"><div className="nt-price-input"><input type="number" inputMode="decimal" min="0" step=".01" value={draft.costPrice.toFixed(2)} onChange={event => set('costPrice', Number(event.target.value) || 0)} /><span>€</span></div></Field>}
          <Field label="Τιμή πώλησης"><div className="nt-price-input"><input type="number" inputMode="decimal" min="0" step=".01" value={draft.price.toFixed(2)} onChange={event => set('price', Number(event.target.value) || 0)} /><span>€</span></div></Field>
          <div className="nt-readonly-value"><span>Πώληση χωρίς ΦΠΑ</span><strong>{formatPrice(sellingPriceExcludingVat)}</strong></div>
          {canViewPurchasePrice && <div className="nt-readonly-value"><span>Κέρδος</span><strong>{formatPrice(grossProfit)}</strong></div>}
        </div>
        <div className="nt-stock-grid">
          <div className="nt-readonly-value"><span>Απόθεμα προμηθευτή</span><strong>{supplierStockLabel}</strong>{supplierStockLabel !== '-' && <small>{supplierStock.source}</small>}</div>
          <div className="nt-readonly-value"><span>Προσωπικό απόθεμα</span><strong>{draft.stockQuantity}</strong>{product.id && onAdjustStock && <Button secondary className="mt-2 w-full" onClick={onAdjustStock}><PackageSearch size={14} /> Ρύθμιση</Button>}</div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="organization-heading">
        <h3 id="organization-heading" className="text-lg font-bold">Οργάνωση & δημοσίευση</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Κατασκευαστής"><select value={draft.brandId} onChange={event => set('brandId', event.target.value)}><option value="">Επιλέξτε</option>{brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></Field>
          <Field label="Κατηγορίες"><CategoryPicker selected={draft.categoryIds} onChange={value => set('categoryIds', value)} categories={productCategories} /></Field>
          <Field label="Κατάσταση"><select value={draft.publicationStatus ?? (draft.active ? 'published' : 'draft')} onChange={event => set('publicationStatus', event.target.value as Product['publicationStatus'])}><option value="draft">Πρόχειρο</option><option value="published">Δημοσιευμένο</option><option value="archived">Αρχειοθετημένο</option></select></Field>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 px-3 text-sm font-semibold"><input type="checkbox" checked={draft.featured} onChange={event => set('featured', event.target.checked)} /> Επιλεγμένο προϊόν στην αρχική</label>
        </div>
      </section>

      <details className="nt-editor-details" open>
        <summary>Προσφορά & ρυθμίσεις αποθήκης</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Τιμή προσφοράς (€)"><input type="number" inputMode="decimal" min="0" step=".01" value={draft.salePrice ?? ''} onChange={event => set('salePrice', event.target.value === '' ? undefined : Number(event.target.value))} /></Field>
          <Field label="Έναρξη προσφοράς"><input type="datetime-local" value={draft.saleStartsAt ?? ''} onChange={event => set('saleStartsAt', event.target.value)} /></Field>
          <Field label="Λήξη προσφοράς"><input type="datetime-local" value={draft.saleEndsAt ?? ''} onChange={event => set('saleEndsAt', event.target.value)} /></Field>
          <Field label="Όριο χαμηλού αποθέματος"><input type="number" inputMode="numeric" min="0" step="1" value={draft.lowStockThreshold} onChange={event => set('lowStockThreshold', Number(event.target.value))} /></Field>
          <Field label="Θέση αποθήκευσης"><input value={draft.attributes.binLocation ?? ''} onChange={event => set('attributes', { ...draft.attributes, binLocation: event.target.value })} /></Field>
          <Field label="Συντελεστής ΦΠΑ"><select value={draft.vatRate} onChange={event => set('vatRate', Number(event.target.value))}><option value="0.24">24%</option><option value="0.13">13%</option><option value="0.06">6%</option><option value="0">0%</option></select></Field>
        </div>
      </details>

      <details className="nt-editor-details" open>
        <summary>Περιγραφές & αρχεία</summary>
        <div className="mt-4 space-y-4"><Field label="Σύντομη περιγραφή"><textarea value={draft.shortDescription} onChange={event => set('shortDescription', event.target.value)} /></Field><Field label="Αναλυτική περιγραφή"><textarea value={draft.fullDescription} onChange={event => set('fullDescription', event.target.value)} /></Field><Field label="Σύνδεσμος εγχειριδίου PDF (https)"><input type="url" inputMode="url" placeholder="https://…" value={draft.manualFiles[0]?.url ?? ''} onChange={event => set('manualFiles', event.target.value ? [{ title: 'Εγχειρίδιο', url: event.target.value, size: '' }] : [])} /></Field></div>
      </details>

      <details className="nt-editor-details">
        <summary>Χαρακτηριστικά & συσκευασία</summary>
        <div className="mt-4 space-y-4">{draft.specifications.map((specification, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><input aria-label="Χαρακτηριστικό" className="nt-input" value={specification.key} onChange={event => set('specifications', draft.specifications.map((value, itemIndex) => itemIndex === index ? { ...value, key: event.target.value } : value))} /><input aria-label="Τιμή και μονάδα" className="nt-input" value={specification.value} onChange={event => set('specifications', draft.specifications.map((value, itemIndex) => itemIndex === index ? { ...value, value: event.target.value } : value))} /><Button secondary onClick={() => set('specifications', draft.specifications.filter((_, itemIndex) => itemIndex !== index))}>Αφαίρεση</Button></div>)}<Button secondary onClick={() => set('specifications', [...draft.specifications, { key: '', value: '' }])}>Προσθήκη χαρακτηριστικού</Button><Field label="Περιεχόμενα συσκευασίας (ένα ανά γραμμή)"><textarea value={draft.includedItems.join('\n')} onChange={event => set('includedItems', event.target.value.split('\n'))} /></Field></div>
      </details>

      <details className="nt-editor-details">
        <summary>Αποστολή & SEO</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Βάρος (kg)"><input type="number" inputMode="decimal" min="0" step=".01" value={draft.weight} onChange={event => set('weight', Number(event.target.value))} /></Field><Field label="Κατηγορία μεταφορικών"><input value={draft.shippingClass ?? ''} onChange={event => set('shippingClass', event.target.value)} /></Field>{(['length', 'width', 'height'] as const).map((key, index) => <Field key={key} label={['Μήκος (cm)', 'Πλάτος (cm)', 'Ύψος (cm)'][index]}><input type="number" inputMode="decimal" min="0" value={draft.dimensions[key]} onChange={event => set('dimensions', { ...draft.dimensions, [key]: Number(event.target.value) })} /></Field>)}<Field label="Τίτλος SEO"><input value={draft.seoTitle} onChange={event => set('seoTitle', event.target.value)} /></Field><Field label="Περιγραφή SEO"><textarea value={draft.seoDescription} onChange={event => set('seoDescription', event.target.value)} /></Field></div>
      </details>

      <details className="nt-editor-details">
        <summary>Παραλλαγές</summary>
        <div className="mt-4 space-y-4">{(draft.variants ?? []).map((variant, index) => <div key={variant.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-2">{(['name', 'sku', 'ean', 'price', 'stockQuantity'] as const).map((key, fieldIndex) => <Field key={key} label={['Όνομα / συνδυασμός', 'SKU', 'Barcode', 'Τιμή (€)', 'Απόθεμα'][fieldIndex]}><input type={fieldIndex >= 3 ? 'number' : 'text'} value={variant[key] ?? ''} onChange={event => set('variants', draft.variants!.map((old, variantIndex) => variantIndex === index ? { ...old, [key]: fieldIndex >= 3 ? Number(event.target.value) : event.target.value, ...(key === 'name' ? { attributes: { επιλογή: event.target.value } } : {}) } : old))} /></Field>)}<Button secondary onClick={() => set('variants', draft.variants!.filter((_, variantIndex) => variantIndex !== index))}>Αφαίρεση</Button></div>)}<Button secondary onClick={() => set('variants', [...(draft.variants ?? []), { id: crypto.randomUUID(), name: '', sku: '', ean: '', price: draft.price, stockQuantity: 0, attributes: {} }])}>Νέα παραλλαγή</Button></div>
      </details>

      <footer className="nt-product-savebar flex items-center justify-end gap-2 border-t bg-white pt-4"><span className="mr-auto text-xs text-neutral-500" role="status">{saveStatus === 'saving' ? 'Αποθήκευση…' : saveStatus === 'error' ? 'Η αποθήκευση απέτυχε' : dirty ? 'Υπάρχουν μη αποθηκευμένες αλλαγές' : 'Χωρίς αλλαγές'}</span><Button secondary onClick={close}>Ακύρωση</Button><Button type="submit" disabled={busy || saveStatus === 'saving'}>{saveStatus === 'saving' ? 'Αποθήκευση…' : <><Check size={16} /> Αποθήκευση</>}</Button></footer>
    </form>
  </Dialog>;
}
