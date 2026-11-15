import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';

  return (
    <div className={`flex min-h-screen flex-col ${isHomePage ? 'home-layout-background' : 'bg-white'}`}>
      <Header />
      <main className={`flex-1 w-full ${isHomePage ? '' : 'max-w-screen-xl mx-auto'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
