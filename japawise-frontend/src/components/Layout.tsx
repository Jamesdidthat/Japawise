import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-screen-xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;