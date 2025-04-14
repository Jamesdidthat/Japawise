import React, { useState } from 'react';
import japawise_logo from '../assets/JapaWise logo.svg';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex justify-between items-center px-5 py-4 max-w-screen-xl mx-auto">
      <div className="h-8 flex items-center">
        <img 
          src={japawise_logo} 
          alt="JapaWise" 
          className="h-full w-auto" 
        />
      </div>
      
      <div className="flex items-center">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex mr-4">
          <a href="/" className="mr-6 text-gray-800 hover:text-gray-600">Home</a>
          <a href="/about" className="text-gray-800 hover:text-gray-600">About</a>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="p-1 focus:outline-none" 
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="text-3xl">≡</span>
        </button>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-16 right-0 bg-white shadow-md py-2 px-4 rounded md:hidden">
            <nav className="flex flex-col">
              <a href="/" className="py-2 text-gray-800 hover:text-gray-600">Home</a>
              <a href="/about" className="py-2 text-gray-800 hover:text-gray-600">About</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;