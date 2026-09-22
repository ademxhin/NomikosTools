import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { TopBar } from './components/layout/TopBar';
import { Header } from './components/layout/Header';
import { MegaMenu } from './components/layout/MegaMenu';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { Footer } from './components/layout/Footer';
import { QuickViewModal } from './components/product/QuickViewModal';
import { NotificationToast } from './components/common/NotificationToast';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { ComparePage } from './pages/ComparePage';
import { BrandDirectoryPage } from './pages/BrandDirectoryPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { InfoPage } from './pages/InfoPage';
import { Order } from './types/order';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Navigate handler that scrolls to top smoothly
  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

    // 15. Admin Logistics & ERP Portal: /admin
    if (currentRoute === '/admin') {
      return <AdminDashboardPage onNavigate={handleNavigate} />;
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
      {/* 1. Top Contact & Value Strip */}
      <TopBar onNavigate={handleNavigate} />

      {/* 2. Main Search-Focused Header */}
      <Header
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* 3. Mega-Menu (Desktop) */}
      <MegaMenu onNavigate={handleNavigate} />

      {/* 4. Responsive Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* 5. Main Active Screen */}
      <main className="flex-1 w-full">{renderView()}</main>

      {/* 6. Comprehensive Industrial Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 7. Global Modals & Notifications */}
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
