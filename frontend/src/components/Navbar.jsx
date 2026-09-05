import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { siteConfig } from '../config/siteConfig';
import { Menu, X, Moon, Sun, User as UserIcon, Phone } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDark = () => setDark(!dark);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Faculty', path: '/teachers' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fcfbf7]/90 dark:bg-gray-900/90 border-b border-[#eceae3] dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 sm:h-20">

          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img
                src="/branding/learnique-logo.jpg"
                alt="LearnIQue logo"
                className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-full bg-white shadow-md ring-1 ring-amber-200/70 group-hover:scale-105 transition-transform"
              />
              <span className="text-2xl font-bold font-serif tracking-tight text-gray-900 dark:text-white">
                {siteConfig.name || 'Learnique'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                      ? 'bg-amber-100/80 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 font-semibold shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user && (user.role === 'STUDENT' || user.role === 'TEACHER') && (
              <Link
                to="/messages"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === '/messages'
                    ? 'bg-amber-100/80 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                  }`}
              >
                Messages
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/owner"
                className="ml-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 hover:bg-primary hover:text-white transition-colors"
              >
                Owner Portal
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Helpline */}
            <a
              href="tel:+919555523882"
              className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-amber-600 transition-colors mr-1"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>92059-53800</span>
            </a>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              aria-label="Toggle theme"
              className="p-2.5 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* User Account / CTA */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={user.role === 'TEACHER' ? '/teacher/dashboard' : (user.role === 'ADMIN' ? '/owner' : '/student/dashboard')}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold shadow hover:scale-105 transition-transform"
                >
                  Dashboard
                </Link>

                <div className="relative group">
                  <button
                    aria-label="User profile menu"
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-400 transition"
                  >
                    <UserIcon size={18} className="text-gray-700 dark:text-gray-300" />
                  </button>

                  <div className="absolute right-0 w-52 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hidden group-hover:block border border-gray-100 dark:border-gray-700 py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      My Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all"
                >
                  Book Free Demo
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Dark Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleDark}
              aria-label="Toggle theme"
              className="p-2 text-gray-500 dark:text-gray-400 rounded-lg"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="p-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#fcfbf7] dark:bg-gray-900 border-b border-[#eae8e1] dark:border-gray-800 px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${isActive
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 font-semibold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user && (user.role === 'STUDENT' || user.role === 'TEACHER') && (
              <Link
                to="/messages"
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Messages
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/owner"
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-primary dark:text-indigo-300 hover:bg-primary/10"
              >
                Owner Portal
              </Link>
            )}
          </nav>

          <div className="border-t border-[#eceae3] dark:border-gray-800 my-4 pt-4">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={user.role === 'TEACHER' ? '/teacher/dashboard' : (user.role === 'ADMIN' ? '/owner' : '/student/dashboard')}
                  className="block w-full text-center px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold text-sm shadow"
                >
                  Open Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="block w-full text-center px-4 py-2 text-sm text-red-600 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="block w-full text-center py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center py-3 bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow"
                >
                  Book Free Demo
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
