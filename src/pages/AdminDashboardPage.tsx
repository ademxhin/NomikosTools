import React, { useState } from 'react';
import {
  Boxes,
  PackageCheck,
  Barcode,
  Rss,
  History,
  AlertTriangle,
  CheckCircle2,
  Search,
  Printer,
  Plus,
  RefreshCw,
  TrendingUp,
  Truck,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { audioService } from '../services/audioService';
import { generateBarcodeSvg } from '../utils/barcodeGenerator';
import { skroutzService } from '../services/skroutzService';
import { Order } from '../types/order';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const {
    products,
    orders,
    brands,
    categories,
    adjustProductStock,
    updateOrderStatus,
    auditLogs,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'picking' | 'labels' | 'feeds' | 'audit'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [scanInput, setScanInput] = useState('');
  const [labelProductIds, setLabelProductIds] = useState<string[]>([products[0]?.id, products[1]?.id]);

  // Statistics
  const totalStockUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalStockValue = products.reduce(
    (acc, p) => acc + (p.price / 1.24) * p.stockQuantity,
    0
  );
  const lowStockProducts = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold);
  const outOfStockProducts = products.filter((p) => p.stockQuantity === 0);
  const pendingOrders = orders.filter((o) => o.status === 'Σε Προετοιμασία' || o.status === 'Σε Picking' || o.status === 'Νέα');

  // Filtered products for inventory table
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ean.includes(searchQuery)
  );

  const activeOrder = orders.find((o) => o.id === selectedOrderId);

  // Barcode scan handler for picking workflow
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim() || !activeOrder) return;

    const scannedCode = scanInput.trim();
    const matchedItem = activeOrder.items.find(
      (item) => item.sku.toLowerCase() === scannedCode.toLowerCase()
    );

    const productByEan = products.find((p) => p.ean === scannedCode);
    const matchedByEan = productByEan
      ? activeOrder.items.find((item) => item.productId === productByEan.id)
      : null;

    const targetItem = matchedItem || matchedByEan;

    if (targetItem) {
      audioService.playSuccess();
      showToast(`Σαρώθηκε επιτυχώς: ${targetItem.name}`);
      // Advance picking
      updateOrderStatus(activeOrder.id, 'Σε Picking', `Σαρώθηκε SKU ${targetItem.sku}`);
    } else {
      audioService.playError();
      showToast(`ΠΡΟΣΟΧΗ: Το barcode ${scannedCode} δεν ανήκει σε αυτή την παραγγελία!`, 'error');
    }
    setScanInput('');
  };

  const handlePrintLabels = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const selected = products.filter((p) => labelProductIds.includes(p.id));
      const labelsHtml = selected
        .map(
          (p) => `
          <div style="border: 1px dashed #333; padding: 10px; width: 280px; margin: 10px; display: inline-block; text-align: center; font-family: sans-serif;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">${p.name}</div>
            <div style="font-size: 10px; color: #555;">SKU: ${p.sku} | ΘΕΣΗ: ${p.attributes?.binLocation || 'A1-R02'}</div>
            <div style="font-size: 14px; font-weight: bold; color: #af101a; margin: 4px 0;">€${p.price.toFixed(2)} με ΦΠΑ</div>
            ${generateBarcodeSvg(p.ean, { height: 40, showText: true })}
          </div>
        `
        )
        .join('');

      printWindow.document.write(`
        <html>
          <head><title>Εκτύπωση Ετικετών Ραφιού</title></head>
          <body onload="window.print()">${labelsHtml}</body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Top Banner */}
      <div className="bg-[#181818] text-white p-6 rounded-lg border border-[#2e2e2e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#af101a] text-white text-[10px] font-mono-spec font-bold px-2 py-0.5 rounded">
              WMS &amp; ERP LOGISTICS PORTAL
            </span>
            <span className="text-xs text-neutral-400">Κέντρο Ασπροπύργου • Terminal 01</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
            ΔΙΑΧΕΙΡΙΣΗ ΑΠΟΘΗΚΗΣ &amp; ΠΑΡΑΓΓΕΛΙΩΝ
          </h1>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-display font-bold uppercase tracking-wider px-4 py-2 rounded border border-neutral-700"
        >
          Επιστροφή στο E-Shop
        </button>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#cfd8dc] p-4 rounded-lg shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-neutral-500 uppercase">ΣΥΝΟΛΙΚΑ ΤΕΜΑΧΙΑ</div>
          <div className="text-2xl font-black font-mono-spec text-neutral-900">
            {totalStockUnits.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono-spec">Σε 4.500 τ.μ. αποθήκης</div>
        </div>

        <div className="bg-white border border-[#cfd8dc] p-4 rounded-lg shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-neutral-500 uppercase">ΚΑΘΑΡΗ ΑΞΙΑ ΣΤΟΚ</div>
          <div className="text-2xl font-black font-mono-spec text-[#af101a]">
            €{totalStockValue.toLocaleString('el-GR', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-neutral-400">Αξία κτήσης χονδρικής</div>
        </div>

        <div className="bg-white border border-[#cfd8dc] p-4 rounded-lg shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-neutral-500 uppercase">ΕΚΚΡΕΜΗ PICKING</div>
          <div className="text-2xl font-black font-mono-spec text-amber-600">
            {pendingOrders.length}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold">Παραγγελίες προς συλλογή</div>
        </div>

        <div className="bg-white border border-[#cfd8dc] p-4 rounded-lg shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-neutral-500 uppercase">ΧΑΜΗΛΟ ΑΠΟΘΕΜΑ</div>
          <div className="text-2xl font-black font-mono-spec text-red-600">
            {lowStockProducts.length + outOfStockProducts.length}
          </div>
          <div className="text-[10px] text-red-700 font-semibold">Απαιτείται αναπαραγγελία</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#cfd8dc] bg-white rounded-t-lg px-4 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'inventory'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΑΠΟΘΗΚΗ &amp; ΣΤΟΚ ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('picking')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'picking'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΣΥΛΛΟΓΗ PICKING &amp; SCANNER ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('labels')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'labels'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΕΤΙΚΕΤΕΣ BARCODE &amp; ΡΑΦΙΩΝ
        </button>
        <button
          onClick={() => setActiveTab('feeds')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'feeds'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          SKROUTZ &amp; BESTPRICE XML
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'audit'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΙΣΤΟΡΙΚΟ ΚΙΝΗΣΕΩΝ (AUDIT LOG)
        </button>
      </div>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Αναζήτηση προϊόντος, SKU ή EAN..."
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded text-xs font-mono-spec focus:outline-none focus:border-[#af101a]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>

            <span className="text-xs text-neutral-500 font-mono-spec">
              Εμφάνιση {filteredProducts.length} από {products.length} κωδικούς
            </span>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 font-display font-bold uppercase text-neutral-600">
                  <th className="p-3">ΠΡΟΪΟΝ / SKU</th>
                  <th className="p-3">EAN-13 BARCODE</th>
                  <th className="p-3">ΘΕΣΗ ΑΠΟΘΗΚΗΣ</th>
                  <th className="p-3">ΑΠΟΘΕΜΑ</th>
                  <th className="p-3">ΤΙΜΗ ΛΙΑΝΙΚΗΣ</th>
                  <th className="p-3 text-right">ΑΥΞΟΜΕΙΩΣΗ ΣΤΟΚ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
                  const isOut = p.stockQuantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{p.name}</div>
                        <div className="font-mono-spec text-[10px] text-neutral-500">
                          SKU: {p.sku} | MPN: {p.manufacturerCode || '-'}
                        </div>
                      </td>
                      <td className="p-3 font-mono-spec text-neutral-700">{p.ean}</td>
                      <td className="p-3">
                        <span className="font-mono-spec font-bold text-xs bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                          {p.attributes?.binLocation || 'A1-R02'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5 font-mono-spec font-bold">
                          {isOut ? (
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">0 (ΕΞΑΝΤΛΗΘΗΚΕ)</span>
                          ) : isLow ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              {p.stockQuantity} (ΧΑΜΗΛΟ)
                            </span>
                          ) : (
                            <span className="text-emerald-700">{p.stockQuantity} τεμ.</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono-spec font-bold">
                        €{p.price.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => {
                              adjustProductStock(p.id, -1, 'adjustment', 'Χειροκίνητη μείωση αποθέματος');
                              audioService.playClick();
                            }}
                            className="w-7 h-7 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-bold"
                            title="Μείωση -1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => {
                              adjustProductStock(p.id, 5, 'restock', 'Παραλαβή εμπορευμάτων από αντιπροσωπεία (+5)');
                              audioService.playSuccess();
                            }}
                            className="bg-[#af101a] hover:bg-[#b71c1c] text-white text-[11px] font-display font-bold uppercase px-2 py-1 rounded"
                            title="Παραλαβή +5 τεμάχια"
                          >
                            +5 ΠΑΡΑΛΑΒΗ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: WMS Picking & Packing Scanner */}
      {activeTab === 'picking' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-neutral-900 uppercase">
                ΤΕΡΜΑΤΙΚΟ ΣΥΛΛΟΓΗΣ (ORDER PICKING CONSOLE)
              </h3>
              <p className="text-xs text-neutral-500">
                Σαρώστε τα barcodes των προϊόντων ή εισάγετε το SKU για επιβεβαίωση συσκευασίας.
              </p>
            </div>

            {/* Order selector */}
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-bold text-neutral-700">Επιλογή Παραγγελίας:</label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="p-2 border border-neutral-300 rounded font-mono-spec bg-white font-bold"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.orderNumber} - {o.customer.firstName} {o.customer.lastName} ({o.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Order Info & Items (Col 7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-neutral-50 p-4 rounded border border-neutral-200 text-xs flex justify-between">
                  <div>
                    <span className="font-bold text-neutral-800">
                      Παραγγελία #{activeOrder.orderNumber}
                    </span>
                    <div className="text-neutral-500">
                      Πελάτης: {activeOrder.customer.firstName} {activeOrder.customer.lastName} ({activeOrder.customer.phone})
                    </div>
                    <div className="text-neutral-500">
                      Αποστολή: {activeOrder.shipping.carrierName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded font-bold text-[11px] bg-amber-100 text-amber-900 border border-amber-300">
                      {activeOrder.status}
                    </span>
                    <div className="text-neutral-900 font-mono-spec font-bold mt-1">
                      {activeOrder.items.length} είδη
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-100 font-display font-bold uppercase text-neutral-600">
                      <tr>
                        <th className="p-3">ΕΙΔΟΣ</th>
                        <th className="p-3">ΘΕΣΗ</th>
                        <th className="p-3">ΠΟΣΟΤΗΤΑ</th>
                        <th className="p-3 text-right">ΚΑΤΑΣΤΑΣΗ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {activeOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <div className="font-bold text-neutral-900">{item.name}</div>
                            <div className="text-[10px] font-mono-spec text-neutral-500">
                              SKU: {item.sku}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono-spec font-bold bg-neutral-100 px-2 py-0.5 rounded border">
                              {item.sku.slice(0, 4)}
                            </span>
                          </td>
                          <td className="p-3 font-mono-spec font-bold text-neutral-800">
                            {item.quantity} τεμ.
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-flex items-center text-emerald-700 font-bold">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Έτοιμο
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      updateOrderStatus(activeOrder.id, 'Σε Picking', 'Έναρξη συλλογής');
                      audioService.playClick();
                    }}
                    className="bg-neutral-800 hover:bg-black text-white text-xs font-display font-bold uppercase px-4 py-2 rounded"
                  >
                    ΕΝΑΡΞΗ PICKING
                  </button>

                  <button
                    onClick={() => {
                      updateOrderStatus(activeOrder.id, 'Έτοιμη για Συσκευασία', 'Ολοκληρώθηκε η συσκευασία');
                      audioService.playSuccess();
                      showToast(`Η παραγγελία #${activeOrder.orderNumber} συσκευάστηκε!`);
                    }}
                    className="bg-[#af101a] hover:bg-[#b71c1c] text-white text-xs font-display font-bold uppercase px-4 py-2 rounded shadow"
                  >
                    ΟΛΟΚΛΗΡΩΣΗ ΣΥΣΚΕΥΑΣΙΑΣ &amp; ΕΚΤΥΠΩΣΗ VOUCHER
                  </button>

                  <button
                    onClick={() => {
                      updateOrderStatus(activeOrder.id, 'Απεστάλη', `Παραδόθηκε στον courier (${activeOrder.shipping.trackingNumber || ''})`);
                      audioService.playSuccess();
                      showToast(`Η παραγγελία #${activeOrder.orderNumber} παραδόθηκε στον courier!`);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-display font-bold uppercase px-4 py-2 rounded"
                  >
                    ΠΑΡΑΔΟΣΗ ΣΤΟΝ COURIER
                  </button>
                </div>
              </div>

              {/* Barcode Scanner Input Box (Col 5) */}
              <div className="lg:col-span-5 bg-[#fafafa] border border-neutral-300 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-neutral-800 flex items-center space-x-1.5">
                    <Barcode className="w-4 h-4 text-[#af101a]" />
                    <span>ΕΞΟΜΟΙΩΤΗΣ BARCODE SCANNER</span>
                  </span>
                  <Volume2 className="w-4 h-4 text-neutral-400" />
                </div>

                <form onSubmit={handleBarcodeScan} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Σαρώστε ή πληκτρολογήστε SKU / EAN:
                    </label>
                    <input
                      type="text"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      placeholder="π.χ. M18-FPD3-502X ή 4058546377312"
                      className="w-full p-2.5 bg-white border-2 border-neutral-400 focus:border-[#af101a] rounded font-mono-spec font-bold text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1e1e1e] hover:bg-black text-white font-display font-bold text-xs uppercase py-2.5 rounded shadow"
                  >
                    ΠΡΟΣΟΜΟΙΩΣΗ ΣΑΡΩΣΗΣ (ENTER)
                  </button>
                </form>

                {/* Quick scan shortcuts for testing */}
                <div className="border-t border-neutral-200 pt-3 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                    ΔΟΚΙΜΑΣΤΙΚΕΣ ΣΑΡΩΣΕΙΣ ΕΙΔΩΝ ΠΑΡΑΓΓΕΛΙΑΣ:
                  </span>
                  <div className="space-y-1.5">
                    {activeOrder.items.map((it) => (
                      <button
                        key={it.productId}
                        type="button"
                        onClick={() => {
                          setScanInput(it.sku);
                        }}
                        className="w-full text-left text-xs bg-white hover:bg-neutral-100 p-2 rounded border border-neutral-200 flex justify-between items-center"
                      >
                        <span className="font-mono-spec font-bold text-neutral-800">{it.sku}</span>
                        <span className="text-[10px] text-neutral-500">Κάντε κλικ για εισαγωγή</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Barcode Labels Generator */}
      {activeTab === 'labels' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-neutral-900 uppercase">
                ΕΚΤΥΠΩΣΗ ΕΤΙΚΕΤΩΝ ΡΑΦΙΟΥ &amp; BARCODE
              </h3>
              <p className="text-xs text-neutral-500">
                Επιλέξτε προϊόντα για μαζική εκτύπωση ετικετών αποθήκης με EAN-13 και τιμές.
              </p>
            </div>

            <button
              onClick={handlePrintLabels}
              className="bg-[#af101a] hover:bg-[#b71c1c] text-white px-5 py-2.5 rounded font-display font-bold uppercase text-xs tracking-wider flex items-center space-x-2 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>ΕΚΤΥΠΩΣΗ ΕΠΙΛΕΓΜΕΝΩΝ ({labelProductIds.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const isSelected = labelProductIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setLabelProductIds((prev) =>
                      isSelected ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                    );
                  }}
                  className={`border p-4 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#af101a] bg-red-50/20 ring-1 ring-[#af101a]'
                      : 'border-neutral-300 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-neutral-900 line-clamp-1">{p.name}</div>
                      <div className="font-mono-spec text-[10px] text-neutral-500">
                        SKU: {p.sku} | Θέση: {p.attributes?.binLocation || 'A1-R02'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-[#af101a]"
                    />
                  </div>

                  <div className="mt-3 bg-white p-2 border border-neutral-200 rounded text-center">
                    <div
                      className="flex justify-center"
                      dangerouslySetInnerHTML={{
                        __html: generateBarcodeSvg(p.ean, { height: 35, showText: true }),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Skroutz & BestPrice XML Feed */}
      {activeTab === 'feeds' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-neutral-200 pb-4">
            <h3 className="font-display font-bold text-lg text-neutral-900 uppercase flex items-center space-x-2">
              <Rss className="w-5 h-5 text-[#af101a]" />
              <span>SKROUTZ &amp; BESTPRICE XML GENERATOR</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Αυτόματη παραγωγή feed συμβατού με τις επίσημες προδιαγραφές Skroutz XML Protocol.
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-300 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-800">
                Κατάσταση Feed: <strong className="text-emerald-700">ΕΝΕΡΓΟ &amp; ΕΠΙΚΑΙΡΟΠΟΙΗΜΕΝΟ</strong>
              </span>
              <span className="font-mono-spec text-neutral-500">
                Τελευταία ανανέωση: Σήμερα, 10:45:00
              </span>
            </div>

            <div className="font-mono-spec bg-white p-3 rounded border border-neutral-300 text-[11px] text-neutral-700 overflow-x-auto max-h-56">
              <pre>{skroutzService.generateXmlFeed(products).slice(0, 800)}...</pre>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const blob = new Blob([skroutzService.generateXmlFeed(products)], {
                    type: 'application/xml',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'nomikos-skroutz-feed.xml';
                  a.click();
                  showToast('Το Skroutz XML Feed κατέβηκε επιτυχώς');
                }}
                className="bg-[#af101a] text-white px-4 py-2 rounded font-display font-bold uppercase text-xs"
              >
                ΛΗΨΗ SKROUTZ XML FEED (.XML)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
              ΙΣΤΟΡΙΚΟ ΕΝΕΡΓΕΙΩΝ &amp; ΔΙΑΚΙΝΗΣΗΣ ΑΠΟΘΗΚΗΣ (AUDIT LOG)
            </h3>
            <span className="text-xs text-neutral-500 font-mono-spec">
              {auditLogs.length} καταγραφές
            </span>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 font-display font-bold uppercase text-neutral-600">
                <tr>
                  <th className="p-3">ΧΡΟΝΟΣ</th>
                  <th className="p-3">ΧΡΗΣΤΗΣ</th>
                  <th className="p-3">ΕΝΕΡΓΕΙΑ</th>
                  <th className="p-3">ΛΕΠΤΟΜΕΡΕΙΕΣ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono-spec">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="p-3 text-neutral-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-bold text-neutral-800">{log.user}</td>
                    <td className="p-3">
                      <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-700">
                      {log.entityName || (log.newValues ? JSON.stringify(log.newValues) : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
