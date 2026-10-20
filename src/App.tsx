import React, { lazy, Suspense, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { MegaMenu } from './components/layout/MegaMenu';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { Footer } from './components/layout/Footer';
import { QuickViewModal } from './components/product/QuickViewModal';
import { NotificationToast } from './components/common/NotificationToast';
import { AccountPage } from './pages/AccountPage';

import { Order } from './types/order';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((module) => ({ default: module.CategoryPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then((module) => ({ default: module.OrderConfirmationPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((module) => ({ default: module.WishlistPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then((module) => ({ default: module.ComparePage })));
const BrandDirectoryPage = lazy(() => import('./pages/BrandDirectoryPage').then((module) => ({ default: module.BrandDirectoryPage })));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage').then((module) => ({ default: module.SearchResultsPage })));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then((module) => ({ default: module.TrackOrderPage })));
const InfoPage = lazy(() => import('./pages/InfoPage').then((module) => ({ default: module.InfoPage })));

const getBrowserRoute = () => `${window.location.pathname}${window.location.search}`;

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>(getBrowserRoute);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Navigate handler that scrolls to top smoothly
  const handleNavigate = (route: string) => {
    if (route !== currentRoute) window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getBrowserRoute());
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render appropriate view based on route pattern
  const renderView = () => {
    // 1. Home
    if (currentRoute === '/' || currentRoute === '') {
      return <HomePage onNavigate={handleNavigate} />;
    }

    // 2. Product Detail: /product/:slug
    if (currentRoute.startsWith('/product/')) {
      const slug = currentRoute.replace('/product/', '').split('?')[0];
      return <ProductDetailPage productSlug={slug} onNavigate={handleNavigate} />;
    }

    // 3. Category: /category/:slug
    if (currentRoute.startsWith('/category/')) {
      const slug = currentRoute.replace('/category/', '').split('?')[0];
      return <CategoryPage categorySlug={slug} onNavigate={handleNavigate} />;
    }

    // 4. All Products / Catalog
    if (currentRoute === '/products' || currentRoute === '/catalog') {
      return <CategoryPage onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/categories') {
      return <CategoriesPage onNavigate={handleNavigate} />;
    }

    // 5. Offers
    if (currentRoute === '/offers') {
      return <CategoryPage categorySlug="prosfores" onNavigate={handleNavigate} />;
    }

    // 6. Search: /search?q=...
    if (currentRoute.startsWith('/search')) {
      const searchParams = new URLSearchParams(currentRoute.split('?')[1] || '');
      const query = searchParams.get('q') || '';
      return <SearchResultsPage query={query} onNavigate={handleNavigate} />;
    }

    // 7. Cart
    if (currentRoute === '/cart') {
      return <CartPage onNavigate={handleNavigate} />;
    }

    // 8. Checkout
    if (currentRoute === '/checkout') {
      return (
        <CheckoutPage
          onNavigate={handleNavigate}
          onOrderCompleted={(order) => setLastCompletedOrder(order)}
        />
      );
    }

    // 9. Order Confirmation: /order-confirmation/:orderNumber
    if (currentRoute.startsWith('/order-confirmation')) {
      const parts = currentRoute.split('/');
      const orderNumber = parts[2] || lastCompletedOrder?.orderNumber || 'NT-84920';
      return <OrderConfirmationPage orderNumber={orderNumber} onNavigate={handleNavigate} />;
    }

    // 10. Account
    if (currentRoute === '/account' || currentRoute === '/login') {
      return <AccountPage onNavigate={handleNavigate} />;
    }

    // 11. Wishlist
    if (currentRoute === '/wishlist') {
      return <WishlistPage onNavigate={handleNavigate} />;
    }

    // 12. Compare
    if (currentRoute === '/compare') {
      return <ComparePage onNavigate={handleNavigate} />;
    }

    // 13. Brand Directory or Single Brand: /brand/:slug or /brands
    if (currentRoute.startsWith('/brand/') || currentRoute === '/brands') {
      const slug = currentRoute.startsWith('/brand/')
        ? currentRoute.replace('/brand/', '').split('?')[0]
        : undefined;
      return <BrandDirectoryPage brandSlug={slug} onNavigate={handleNavigate} />;
    }

    // 14. Track Order: /track-order
    if (currentRoute.startsWith('/track-order')) {
      const searchParams = new URLSearchParams(currentRoute.split('?')[1] || '');
      const voucher = searchParams.get('voucher') || undefined;
      return <TrackOrderPage initialVoucher={voucher} onNavigate={handleNavigate} />;
    }

    // Keep the unfinished admin portal inaccessible to storefront visitors.
    if (currentRoute === '/admin' || currentRoute.startsWith('/admin/')) {
      return <HomePage onNavigate={handleNavigate} />;
    }

    // 16. Informational pages
    if (currentRoute === '/about') {
      return <InfoPage pageType="about" onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/services') {
      return <InfoPage pageType="services" onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/contact') {
      return <InfoPage pageType="contact" onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/warranty' || currentRoute === '/returns') {
      return <InfoPage pageType="warranty" onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/terms' || currentRoute === '/privacy') {
      return <InfoPage pageType="terms" onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/shipping' || currentRoute === '/payments' || currentRoute === '/shipping-payment') {
      return <InfoPage pageType="shipping-payment" onNavigate={handleNavigate} />;
    }

    // Fallback: Home
    return <HomePage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] text-neutral-900 font-sans antialiased">
      {/* 1. Main Search-Focused Header */}
      <Header
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onToggleMegaMenu={() => setIsMegaMenuOpen((open) => !open)}
        isMegaMenuOpen={isMegaMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* 2. Mega-Menu (Desktop) */}
      <MegaMenu onNavigate={handleNavigate} isOpen={isMegaMenuOpen} onOpenChange={setIsMegaMenuOpen} />

      {/* 3. Responsive Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* 4. Main Active Screen */}
      <main className="flex-1 w-full">
        <Suspense
          fallback={
            <div className="min-h-[45vh] grid place-items-center bg-[#f4f4f2]" role="status">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-neutral-700">
                <span className="h-5 w-5 animate-spin border-2 border-neutral-300 border-t-[#e21b22] rounded-full" />
                Φόρτωση περιεχομένου
              </div>
            </div>
          }
        >
          {renderView()}
        </Suspense>
      </main>

      {/* 5. Comprehensive Industrial Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 6. Global Modals & Notifications */}
      <QuickViewModal onNavigate={handleNavigate} />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
}
