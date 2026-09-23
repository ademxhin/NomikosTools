import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { initialOrders } from '../data/ordersData';
import { initialStockMovements, initialCountSessions } from '../data/inventoryData';
import { initialAuditLogs } from '../data/auditData';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariantId?: string;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface StoreContextType {
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
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
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
          Array.isArray(storedProduct.images) && storedProduct.images.length > 0
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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage or Fallback
  const [products, setProducts] = useState<Product[]>(() =>
    normalizeStoredProducts(localStorage.getItem('nomikos_products'))
  );

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('nomikos_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('nomikos_brands');
    return saved ? JSON.parse(saved) : initialBrands;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nomikos_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('nomikos_movements');
    return saved ? JSON.parse(saved) : initialStockMovements;
  });

  const [countSessions, setCountSessions] = useState<InventoryCountSession[]>(() => {
    const saved = localStorage.getItem('nomikos_counts');
    return saved ? JSON.parse(saved) : initialCountSessions;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('nomikos_audit');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nomikos_cart');
    return saved ? JSON.parse(saved) : [
      { product: initialProducts[0], quantity: 1 },
      { product: initialProducts[4], quantity: 2 },
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('nomikos_wishlist');
    return saved ? JSON.parse(saved) : ['prod-milw-m18fpd3', 'prod-dewalt-dws780'];
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    const saved = localStorage.getItem('nomikos_compare');
    return saved ? JSON.parse(saved) : ['prod-milw-m18fpd3', 'prod-dewalt-dcd996p2', 'prod-makita-dhp486'];
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isB2BMode, setIsB2BMode] = useState<boolean>(() => {
    return localStorage.getItem('nomikos_b2b') === 'true';
  });
  const [activeRole, setActiveRole] = useState<AdminRole>('Super Admin');
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
      id: `aud-${Date.now()}`,
      user: `Διαχειριστής (${activeRole})`,
      userRole: activeRole,
      action,
      entity,
      entityId,
      entityName,
      previousValues: prev,
      newValues: curr,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prevList) => [newEntry, ...prevList]);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variantId?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { product, quantity, selectedVariantId: variantId }];
    });
    showToast(`Προστέθηκε στο καλάθι: ${product.name.slice(0, 35)}...`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
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
      const price = item.product.salePrice || item.product.price;
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
    const id = `prod-nt-${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog('Δημιουργία Νέου Προϊόντος', 'product', id, newProduct.name, null, newProduct);
    showToast(`Το προϊόν "${newProduct.name.slice(0, 30)}" αποθηκεύτηκε επιτυχώς`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          addAuditLog('Ενημέρωση Προϊόντος', 'product', id, p.name, p, updated);
          return updated;
        }
        return p;
      })
    );
    showToast('Το προϊόν ενημερώθηκε');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('Διαγραφή Προϊόντος', 'product', id, prod?.name);
    showToast('Το προϊόν διαγράφηκε', 'warning');
  };

  const duplicateProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const duplicated: Product = {
      ...prod,
      id: `prod-copy-${Date.now()}`,
      name: `${prod.name} (Αντίγραφο)`,
      sku: `${prod.sku}-COPY`,
      ean: `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [duplicated, ...prev]);
    addAuditLog('Αντιγραφή Προϊόντος', 'product', duplicated.id, duplicated.name);
    showToast('Δημιουργήθηκε αντίγραφο προϊόντος');
  };

  const bulkUpdateProducts = (ids: string[], updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    addAuditLog('Μαζική Ενημέρωση Προϊόντων', 'product', ids.join(','), `${ids.length} Προϊόντα`, null, updates);
    showToast(`Ενημερώθηκαν επιτυχώς ${ids.length} προϊόντα`);
  };

  const adjustProductStock = (
    productId: string,
    quantityChange: number,
    reason: string,
    details?: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const oldQty = prod.stockQuantity;
    const newQty = Math.max(0, oldQty + quantityChange);
    const availabilityStatus = newQty === 0 ? 'out_of_stock' : newQty <= prod.lowStockThreshold ? 'low_stock' : 'in_stock';

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newQty, availabilityStatus } : p))
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
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
    setOrders((prev) => [order, ...prev]);
    addAuditLog('Νέα Παραγγελία E-Shop', 'order', order.id, `Παραγγελία #${order.orderNumber}`, null, order);
    clearCart();
    showToast(`Η παραγγελία #${order.orderNumber} καταχωρήθηκε επιτυχώς!`);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const historyItem = {
            status: newStatus,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            user: `Διαχειριστής (${activeRole})`,
            note,
          };
          const updated = {
            ...o,
            status: newStatus,
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            statusHistory: [...o.statusHistory, historyItem],
          };
          addAuditLog('Αλλαγή Κατάστασης Παραγγελίας', 'order', orderId, `Παραγγελία #${o.orderNumber}`, { status: o.status }, { status: newStatus });
          return updated;
        }
        return o;
      })
    );
    showToast(`Η παραγγελία άλλαξε κατάσταση σε: ${newStatus}`);
  };

  const updateOrderItemPicked = (orderId: string, sku: string, quantity: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((item) =>
            item.sku === sku ? { ...item, pickedQuantity: quantity } : item
          );
          // Check if all lines are picked
          const allPicked = updatedItems.every(
            (item) => (item.pickedQuantity || 0) >= item.quantity
          );
          return {
            ...o,
            items: updatedItems,
            status: allPicked ? 'Έτοιμη για Συσκευασία' : o.status,
          };
        }
        return o;
      })
    );
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat: Category = { ...categoryData, id };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('Δημιουργία Κατηγορίας', 'category', id, newCat.name);
    showToast(`Η κατηγορία "${newCat.name}" προστέθηκε`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Η κατηγορία ενημερώθηκε');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Η κατηγορία διαγράφηκε', 'warning');
  };

  const updateCountSession = (sessionId: string, updates: Partial<InventoryCountSession>) => {
    setCountSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        brands,
        orders,
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
