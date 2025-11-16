import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

const Layout = () => {
  const location = useLocation();
  const isShopList = location.pathname === '/';
  const isProductDetail = location.pathname.startsWith('/product/');
  const isOrdersPage = location.pathname === '/orders';

  return (
    <div className="flex flex-col min-h-screen">
      <Header showLogo={!isShopList} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isShopList && !isProductDetail && !isOrdersPage && <Footer />}
      <BottomNav />
    </div>
  );
};

export default Layout;
