import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { can, nextOrderStatus, validateCategoryParent, validateProduct } from '../services/workspacePolicy';
import { DEMO_MODE } from '../services/runtime';
import { demoStorage as localStorage } from '../services/demoStorage';
import { commitOrder, releaseOrderStock } from '../services/orderTransaction';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { Brand } from '../types/brand';
import { Order, OrderStatus } from '../types/order';
import { StockMovement, InventoryCountSession } from '../types/inventory';
import { AuditLogEntry } from '../types/audit';
import { AdminRole, User } from '../types/user';
import { initialProducts } from '../data/productsData';
import { initialCategories } from '../data/categoriesData';
import { initialBrands } from '../data/brandsData';

// The catalog is generated from the supplier Excel export. Bump this when the
// source catalog is intentionally replaced so old browser-local products do
// not survive the migration.
const PRODUCT_CATALOG_VERSION = 'excel-2026-09-24-v2-category-hierarchy';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariantId?: string;
  unitPrice?: number;
  offerId?: string;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface StoreContextType {
  allProducts: Product[];
  updateOrderDetails: (id: string, tracking: string, note: string) => void;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  stockMovements: StockMovement[];
  countSessions: InventoryCountSession[];
  auditLogs: AuditLogEntry[];
  cart: CartItem[];
  wishlist: string[];
  compareList: string[];
  quickViewProduct: Product | null;
  isB2BMode: boolean;
  activeRole: AdminRole;
  toast: ToastNotification | null;
  setIsB2BMode: (b2b: boolean) => void;
  setActiveRole: (role: AdminRole) => void;
  setQuickViewProduct: (product: Product | null) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  // Cart Actions
  addToCart: (product: Product, quantity?: number, variantId?: string, unitPrice?: number, offerId?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartVat: () => number;
  getCartTotal: () => number;
  // Wishlist & Compare
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  // Admin Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => void;
  adjustProductStock: (productId: string, quantityChange: number, reason: string, details?: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  updateOrderItemPicked: (orderId: string, sku: string, quantity: number) => void;
  addAuditLog: (action: string, entity: AuditLogEntry['entity'], entityId: string, entityName?: string, prev?: any, curr?: any) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateCountSession: (sessionId: string, updates: Partial<InventoryCountSession>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const normalizeStoredProducts = (value: string | null): Product[] => {
  if (!value) return initialProducts;

  try {
    const storedProducts = JSON.parse(value) as Partial<Product>[];
    if (!Array.isArray(storedProducts)) return initialProducts;

    return storedProducts.map((storedProduct, index) => {
      const catalogProduct = initialProducts.find(
        (product) => product.id === storedProduct.id || product.sku === storedProduct.sku
      );
      const fallbackProduct = catalogProduct ?? initialProducts[index % initialProducts.length];

      return {
        ...fallbackProduct,
        ...storedProduct,
        categoryIds: Array.isArray(storedProduct.categoryIds)
          ? storedProduct.categoryIds
          : fallbackProduct.categoryIds,
        images:
          Array.isArray(storedProduct.images)
            ? storedProduct.images
            : fallbackProduct.images,
        attributes: storedProduct.attributes ?? fallbackProduct.attributes ?? {},
        specifications: Array.isArray(storedProduct.specifications)
          ? storedProduct.specifications
          : fallbackProduct.specifications ?? [],
        includedItems: Array.isArray(storedProduct.includedItems)
          ? storedProduct.includedItems
          : fallbackProduct.includedItems ?? [],
        compatibleProductIds: Array.isArray(storedProduct.compatibleProductIds)
          ? storedProduct.compatibleProductIds
          : fallbackProduct.compatibleProductIds ?? [],
        relatedProductIds: Array.isArray(storedProduct.relatedProductIds)
          ? storedProduct.relatedProductIds
          : fallbackProduct.relatedProductIds ?? [],
        manualFiles: Array.isArray(storedProduct.manualFiles)
          ? storedProduct.manualFiles
          : fallbackProduct.manualFiles ?? [],
        createdAt: storedProduct.createdAt ?? fallbackProduct.createdAt,
        updatedAt: storedProduct.updatedAt ?? fallbackProduct.updatedAt,
      } as Product;
    });
  } catch {
    return initialProducts;
  }
};

const readStoredArray = <T,>(key: string, fallback: T[]): T[] => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const requirePermission = (permission: Parameters<typeof can>[1]) => {
    if (!DEMO_MODE || !can(user, permission)) throw new Error('Δεν έχετε δικαίωμα για αυτή την ενέργεια.');
  };
  const catalogVersionMatches = localStorage.getItem('nomikos_catalog_version') === PRODUCT_CATALOG_VERSION;
  if (!catalogVersionMatches) {
    localStorage.removeItem('nomikos_products');
    localStorage.removeItem('nomikos_categories');
    localStorage.removeItem('nomikos_brands');
    localStorage.removeItem('nomikos_cart');
    localStorage.removeItem('nomikos_wishlist');
    localStorage.removeItem('nomikos_compare');
    localStorage.setItem('nomikos_catalog_version', PRODUCT_CATALOG_VERSION);
  }

  // Initialize from LocalStorage or the Excel-backed catalog.
  const [products, setProducts] = useState<Product[]>(() =>
    normalizeStoredProducts(localStorage.getItem('nomikos_products'))
  );

  const [categories, setCategories] = useState<Category[]>(() => {
    const storedCategories = readStoredArray('nomikos_categories', initialCategories);
    const hasParentHierarchy = storedCategories.some(
      (category) => typeof category.parentId === 'string' && category.parentId.startsWith('parent-')
    );
    return hasParentHierarchy ? storedCategories : initialCategories;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    return readStoredArray('nomikos_brands', initialBrands);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return DEMO_MODE ? readStoredArray('nomikos_orders', []) : [];
  });
  const productsRef = useRef(products);
  productsRef.current = products;
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    return readStoredArray('nomikos_movements', []);
  });

  const [countSessions, setCountSessions] = useState<InventoryCountSession[]>(() => {
    return readStoredArray('nomikos_counts', []);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return readStoredArray('nomikos_audit', []);
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = readStoredArray<CartItem>('nomikos_cart', [
      { product: initialProducts[0], quantity: 1 },
      { product: initialProducts[4], quantity: 2 },
    ]);
    return saved;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    return readStoredArray('nomikos_wishlist', initialProducts.slice(0, 2).map((product) => product.id));
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    return readStoredArray('nomikos_compare', initialProducts.slice(0, 3).map((product) => product.id));
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isB2BMode, setIsB2BMode] = useState<boolean>(() => {
    return localStorage.getItem('nomikos_b2b') === 'true';
  });
  const [activeRole, setActiveRole] = useState<AdminRole>('Super Admin');
  useEffect(() => { setActiveRole(user?.adminRole ?? 'Read Only'); }, [user?.adminRole]);
  useEffect(() => { localStorage.setItem('nomikos_movements', JSON.stringify(stockMovements)); }, [stockMovements]);
  useEffect(() => { localStorage.setItem('nomikos_audit', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => {
    const notify = () => window.alert('Δεν ήταν δυνατή η τοπική αποθήκευση. Οι αλλαγές υπάρχουν μόνο στην τρέχουσα σελίδα. Μειώστε τον όγκο εικόνων πριν την ανανέωση.');
    window.addEventListener('nt-storage-error', notify);
    return () => window.removeEventListener('nt-storage-error', notify);
  }, []);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nomikos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nomikos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('nomikos_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('nomikos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nomikos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nomikos_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('nomikos_compare', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('nomikos_b2b', String(isB2BMode));
  }, [isB2BMode]);

  const showToast = (message: string, type: ToastNotification['type'] = 'success') => {
    const id = Date.now().toString();
    setToast({ id, type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const addAuditLog = (
    action: string,
    entity: AuditLogEntry['entity'],
    entityId: string,
    entityName?: string,
    prev?: any,
    curr?: any
  ) => {
    const newEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      user: `Διαχειριστής (${activeRole})`,
      userRole: activeRole,
      action,
      entity,
      entityId,
      entityName,
      previousValues: entity === 'order' ? undefined : prev,
      newValues: entity === 'order' ? undefined : curr,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prevList) => [newEntry, ...prevList]);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variantId?: string, unitPrice?: number, offerId?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id && item.offerId === offerId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { product, quantity, selectedVariantId: variantId, unitPrice, offerId }];
    });
    showToast(`Προστέθηκε στο καλάθι: ${product.name.slice(0, 35)}...`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const removed = prev.find((item) => item.product.id === productId);
      if (!removed?.offerId) {
        return prev.filter((item) => item.product.id !== productId);
      }

      return prev
        .filter((item) => item.product.id !== productId)
        .map((item) => item.offerId === removed.offerId
          ? { ...item, unitPrice: undefined, offerId: undefined }
          : item);
    });
    showToast('Το προϊόν αφαιρέθηκε από το καλάθι', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.unitPrice ?? item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
  };

  const getCartVat = () => {
    const gross = getCartSubtotal();
    return Number((gross - gross / 1.24).toFixed(2));
  };

  const getCartTotal = () => {
    const sub = getCartSubtotal();
    const shipping = sub >= 50 || sub === 0 ? 0 : 3.50;
    return Number((sub + shipping).toFixed(2));
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Αφαιρέθηκε από τα αγαπημένα', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Προστέθηκε στη λίστα επιθυμιών');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Compare
  const toggleCompare = (productId: string) => {
    setCompareList((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Αφαιρέθηκε από τη σύγκριση', 'info');
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 4) {
        showToast('Μπορείτε να συγκρίνετε έως 4 εργαλεία ταυτόχρονα', 'warning');
        return prev;
      }
      showToast('Προστέθηκε στη σύγκριση εργαλείων');
      return [...prev, productId];
    });
  };

  const isInCompare = (productId: string) => compareList.includes(productId);
  const clearCompare = () => setCompareList([]);

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    requirePermission('catalog');
    const id = `prod-nt-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    validateProduct(newProduct, productsRef.current);
    productsRef.current = [newProduct, ...productsRef.current];
    setProducts(productsRef.current);
    addAuditLog('Δημιουργία Νέου Προϊόντος', 'product', id, newProduct.name, null, { sku: newProduct.sku });
    showToast(`Το προϊόν "${newProduct.name.slice(0, 30)}" αποθηκεύτηκε επιτυχώς`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    requirePermission('catalog');
    const original = productsRef.current.find(p => p.id === id);
    if (!original) throw new Error('Το προϊόν δεν βρέθηκε.');
    validateProduct({ ...original, ...updates }, productsRef.current);
    const updated = { ...original, ...updates, updatedAt: new Date().toISOString() };
    productsRef.current = productsRef.current.map(p => p.id === id ? updated : p);
    setProducts(productsRef.current);
    addAuditLog('Ενημέρωση Προϊόντος', 'product', id, original.name, { sku: original.sku, stock: original.stockQuantity, price: original.price }, { sku: updated.sku, stock: updated.stockQuantity, price: updated.price });
    showToast('Το προϊόν ενημερώθηκε');
  };

  const deleteProduct = (id: string) => {
    requirePermission('catalog');
    const prod = productsRef.current.find((p) => p.id === id);
    productsRef.current = productsRef.current.map(p => p.id === id ? { ...p, active: false, publicationStatus: 'archived' } : p);
    setProducts(productsRef.current);
    addAuditLog('Διαγραφή Προϊόντος', 'product', id, prod?.name);
    showToast('Το προϊόν διαγράφηκε', 'warning');
  };

  const duplicateProduct = (id: string) => {
    requirePermission('catalog');
    const prod = productsRef.current.find((p) => p.id === id);
    if (!prod) return;
    const duplicated: Product = {
      ...prod,
      id: `prod-copy-${Date.now()}`,
      name: `${prod.name} (Αντίγραφο)`,
      sku: `${prod.sku}-COPY-${Date.now()}`,
      slug: `${prod.slug}-copy-${Date.now()}`,
      ean: '',
      active: false,
      publicationStatus: 'draft',
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    productsRef.current = [duplicated, ...productsRef.current];
    setProducts(productsRef.current);
    addAuditLog('Αντιγραφή Προϊόντος', 'product', duplicated.id, duplicated.name);
    showToast('Δημιουργήθηκε αντίγραφο προϊόντος');
  };

  const bulkUpdateProducts = (ids: string[], updates: Partial<Product>) => {
    requirePermission('catalog');
    productsRef.current = productsRef.current.map((p) =>
      ids.includes(p.id) ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setProducts(productsRef.current);
    addAuditLog('Μαζική Ενημέρωση Προϊόντων', 'product', ids.join(','), `${ids.length} Προϊόντα`, null, updates);
    showToast(`Ενημερώθηκαν επιτυχώς ${ids.length} προϊόντα`);
  };

  const adjustProductStock = (
    productId: string,
    quantityChange: number,
    reason: string,
    details?: string
  ) => {
    requirePermission('warehouse');
    const prod = productsRef.current.find((p) => p.id === productId);
    if (!prod) return;

    const oldQty = prod.stockQuantity;
    if (!Number.isInteger(quantityChange) || !reason.trim() || oldQty + quantityChange < 0) throw new Error('Μη έγκυρη ποσότητα ή αιτιολογία.');
    const newQty = oldQty + quantityChange;
    const availabilityStatus = newQty === 0 ? 'out_of_stock' : newQty <= prod.lowStockThreshold ? 'low_stock' : 'in_stock';

    productsRef.current = productsRef.current.map((p) => p.id === productId ? { ...p, stockQuantity: newQty, availabilityStatus, updatedAt: new Date().toISOString() } : p);
    setProducts(productsRef.current);

    const movement: StockMovement = {
      id: crypto.randomUUID(),
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      locationId: 'loc-main',
      locationName: 'Κεντρικό Logistics Center - Ασπρόπυργος',
      quantityChange,
      previousQuantity: oldQty,
      newQuantity: newQty,
      reason: reason as any,
      reasonDetails: details || `Μεταβολή από ${oldQty} σε ${newQty}`,
      user: `Χρήστης (${activeRole})`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setStockMovements((prev) => [movement, ...prev]);
    addAuditLog('Μεταβολή Αποθέματος', 'inventory', prod.id, prod.name, { stockQuantity: oldQty }, { stockQuantity: newQty, reason });
  };

  const addOrder = (order: Order) => {
    if (!DEMO_MODE) throw new Error('Το checkout αναμένει σύνδεση με το backend.');
    if (ordersRef.current.some(o => o.id === order.id)) return;
    const transaction = commitOrder(productsRef.current, ordersRef.current, order, user?.id);
    const snapshot = transaction.order;
    productsRef.current = transaction.products;
    ordersRef.current = transaction.orders;
    if (!user) sessionStorage.setItem('nt-demo-guest-order', snapshot.id);
    setProducts(productsRef.current);
    setOrders(ordersRef.current);
    addAuditLog('Νέα Παραγγελία E-Shop', 'order', order.id, `Παραγγελία #${order.orderNumber}`, null, order);
    clearCart();
    showToast(`Η παραγγελία #${order.orderNumber} καταχωρήθηκε επιτυχώς!`);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    requirePermission('orders');
    const current = ordersRef.current.find(o => o.id === orderId);
    if (!current || !nextOrderStatus(current, newStatus)) return;
    if (newStatus === 'Ακυρώθηκε' && current.stockCommitted) {
      productsRef.current = releaseOrderStock(productsRef.current, current);
      setProducts(productsRef.current);
    }
    const historyItem = {
      status: newStatus,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      user: `Διαχειριστής (${activeRole})`,
      note,
    };
    ordersRef.current = ordersRef.current.map(o => o.id === orderId ? {
      ...o,
      status: newStatus,
      stockCommitted: newStatus === 'Ακυρώθηκε' ? false : o.stockCommitted,
      updatedAt: historyItem.timestamp,
      statusHistory: [...o.statusHistory, historyItem],
    } : o);
    setOrders(ordersRef.current);
    addAuditLog('Αλλαγή Κατάστασης Παραγγελίας', 'order', orderId, `Παραγγελία #${current.orderNumber}`, { status: current.status }, { status: newStatus });
    showToast(`Η παραγγελία άλλαξε κατάσταση σε: ${newStatus}`);
  };

  const updateOrderItemPicked = (orderId: string, sku: string, quantity: number) => {
    requirePermission('warehouse');
    const order = ordersRef.current.find(o => o.id === orderId);
    const item = order?.items.find(i => i.sku === sku);
    if (!order || !item || order.status !== 'Σε Picking' || !Number.isInteger(quantity) || quantity < 0 || quantity > item.quantity) throw new Error('Λάθος είδος, ποσότητα ή κατάσταση συλλογής.');
    ordersRef.current = ordersRef.current.map(o => o.id === orderId ? {
      ...o,
      items: o.items.map(i => i.sku === sku ? { ...i, pickedQuantity: quantity } : i),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    } : o);
    setOrders(ordersRef.current);
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    requirePermission('catalog');
    const id = `cat-${Date.now()}`;
    const newCat: Category = { ...categoryData, id };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('Δημιουργία Κατηγορίας', 'category', id, newCat.name);
    showToast(`Η κατηγορία "${newCat.name}" προστέθηκε`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    requirePermission('catalog');
    validateCategoryParent(categories, id, updates.parentId);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Η κατηγορία ενημερώθηκε');
  };

  const deleteCategory = (id: string) => {
    requirePermission('catalog');
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Η κατηγορία διαγράφηκε', 'warning');
  };

  const updateCountSession = (sessionId: string, updates: Partial<InventoryCountSession>) => {
    requirePermission('warehouse');
    setCountSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products: products.filter(p => p.active),
        allProducts: can(user, 'catalog') || can(user, 'warehouse') ? products : products.filter(p => p.active),
        updateOrderDetails: (id, tracking, note) => {
          requirePermission('orders');
          if (!ordersRef.current.some(o => o.id === id)) throw new Error('Η παραγγελία δεν βρέθηκε.');
          ordersRef.current = ordersRef.current.map(o => o.id === id ? { ...o, shipping: { ...o.shipping, trackingNumber: tracking.trim() },
            internalNotes: note.trim() ? [...(o.internalNotes ?? []), { text: note.trim(), at: new Date().toISOString(), author: user?.name ?? '' }] : o.internalNotes } : o);
          setOrders(ordersRef.current);
        },
        categories,
        brands,
        orders: can(user, 'orders') || can(user, 'support') ? orders : orders.filter(o => user ? o.customerId === user.id : o.id === sessionStorage.getItem('nt-demo-guest-order')),
        stockMovements,
        countSessions,
        auditLogs,
        cart,
        wishlist,
        compareList,
        quickViewProduct,
        isB2BMode,
        activeRole,
        toast,
        setIsB2BMode,
        setActiveRole,
        setQuickViewProduct,
        showToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartSubtotal,
        getCartVat,
        getCartTotal,
        toggleWishlist,
        isInWishlist,
        toggleCompare,
        isInCompare,
        clearCompare,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        bulkUpdateProducts,
        adjustProductStock,
        addOrder,
        updateOrderStatus,
        updateOrderItemPicked,
        addAuditLog,
        addCategory,
        updateCategory,
        deleteCategory,
        updateCountSession,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
