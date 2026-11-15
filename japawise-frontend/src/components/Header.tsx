import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import japawise_logo from '../assets/JapaWise logo.svg';
import AuthModal from '../AuthModal';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const linkClass = (path: string) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      location.pathname === path
        ? 'bg-[#5f4518] text-white shadow-sm'
        : 'text-[#5c4b2a] hover:bg-[#f3ead7] hover:text-[#2f2614]'
    }`;

  const mobileLinkClass = (path: string) =>
    `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      location.pathname === path
        ? 'bg-[#5f4518] text-white'
        : 'bg-white text-[#5c4b2a] border border-[#e6d9be] hover:bg-[#f7f1e3]'
    }`;


  return (
    <>
      <header className="site-glass-nav z-50">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={japawise_logo} alt="JapaWise" className="h-10 w-auto" />
            
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-2 rounded-full border border-white/60 bg-white/45 p-1 shadow-sm backdrop-blur-md">
              {currentUser && (
                <Link to="/chat/new" className={linkClass('/chat/new')}>
                  Chats
                </Link>
              )}
              <Link to="/" className={linkClass('/')}>
                Home
              </Link>
              <Link to="/about" className={linkClass('/about')}>
                About
              </Link>
            </nav>

            {currentUser && (
              <div className="hidden lg:block rounded-full border border-[#e6d9be] bg-[#fff8eb] px-4 py-2 text-sm font-medium text-[#5d4e2d]">
                Howfar, {currentUser.displayName || 'you'}!
              </div>
            )}

            {currentUser ? (
              <button
                onClick={() => signOut(auth)}
                className="rounded-full border border-[#d86b5c] px-4 py-2 text-sm font-semibold text-[#c53d2d] transition hover:bg-[#fff1ef]"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-full bg-[#f28c28] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#dd7d18]"
              >
                Log In
              </button>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-full border border-[#e6d9be] bg-white p-3 text-[#5c4b2a] shadow-sm transition hover:bg-[#f7f1e3] md:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="text-2xl leading-none">≡</span>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/60 bg-[#fffdf2]/85 px-4 py-4 shadow-lg backdrop-blur-xl md:hidden">
            <nav className="mx-auto flex max-w-screen-xl flex-col gap-3">
              {currentUser && (
                <Link to="/chat/new" className={mobileLinkClass('/chat/new')}>
                  Chats
                </Link>
              )}
              <Link to="/" className={mobileLinkClass('/')}>
                Home
              </Link>
              <Link to="/about" className={mobileLinkClass('/about')}>
                About
              </Link>

              {currentUser && (
                <div className="rounded-2xl border border-[#e6d9be] bg-[#fff8eb] px-4 py-3 text-sm font-medium text-[#5d4e2d]">
                  Howfar, {currentUser.displayName || 'you'}!
                </div>
              )}

              {currentUser ? (
                <button
                  onClick={() => signOut(auth)}
                  className="rounded-2xl border border-[#d86b5c] px-4 py-3 text-left text-sm font-semibold text-[#c53d2d] transition hover:bg-[#fff1ef]"
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-2xl bg-[#f28c28] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:bg-[#dd7d18]"
                >
                  Log In
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

    
    </>
  );
};

export default Header;
