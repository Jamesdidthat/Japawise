import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import japawise_logo from '../assets/JapaWise logo.svg';
import AuthModal from '../AuthModal'; // Adjust path if needed
import { auth } from '../firebase'; // Adjust path if needed
import { signOut, onAuthStateChanged} from 'firebase/auth';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
  });
  return () => unsubscribe(); // clean up on unmount
}, []);


  return (
    <>
      <header className="flex justify-between items-center px-5 py-8 max-w-screen-xl mx-auto">
        <div className="h-10 flex items-center">
          <img
            src={japawise_logo}
            alt="JapaWise"
            className="h-full w-auto"
          />
        </div>

        {currentUser && (
           <p className="text-gray-700 font-medium">
                  Howfar {currentUser.displayName || 'you'}!
                </p>
        )}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-14 mr-4">
            <Link to="/" className="text-gray-800 font-bold hover:text-gray-600"
            style={{ color: "#585123" }}>
              Home
            </Link>
            <Link to="/about" className="text-gray-800 font-bold hover:text-gray-600">
              About
            </Link>
          

            {currentUser ? (
              <>
               
                <button
                  onClick={() => signOut(auth)}
                  className="text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-100 ml-12"
                >
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ml-12"
              >
                Log In
              </button>
            )}

          </nav>

          {/* Mobile Menu Button */}
          <button
            className="p-1 md:hidden focus:outline-none"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="text-3xl">≡</span>
          </button>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="absolute top-16 right-0 bg-white shadow-md py-2 px-4 rounded md:hidden z-50">
              <nav className="flex flex-col space-y-2">
                <Link to="/" className="text-gray-800 hover:text-gray-600 ">
                  Home
                </Link>
                <Link to="/about" className="text-gray-800 hover:text-gray-600">
                  About
                </Link>
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMenuOpen(false);
                  }}
                  className="text-left bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                >
                  Log In
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

    
    </>
  );
};

export default Header;
