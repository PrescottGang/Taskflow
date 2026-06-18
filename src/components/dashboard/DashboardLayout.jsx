import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  CheckCircle,
  Menu,
  LayoutDashboard,
  CheckSquare,
  Tag,
  Settings,
  LogOut,
  Bell,
  Calendar,
  Users,
  Sun,
  Moon,
  Monitor,
  X,
  ChevronDown,
} from "lucide-react";

// Composant Avatar
const Avatar = ({ src, alt, fallback, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ${className}`}>
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-sm font-medium text-gray-600">
          {fallback}
        </span>
      )}
    </div>
  );
};

// Hook pour gérer le thème
const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
    applyTheme(initialTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };
    mediaQuery.addListener(handleSystemThemeChange);

    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, []);

  const applyTheme = (selectedTheme) => {
    document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    localStorage.setItem('theme', selectedTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
};

// Composant ModeToggle
const ModeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeTheme = (newTheme) => {
    if (theme !== newTheme) {
      toggleTheme();
    }
    setDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {dropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 bg-white dark:bg-gray-800 dark:ring-gray-700"
        >
          <div className="py-1">
            <button
              onClick={() => changeTheme('light')}
              className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                theme === 'light'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Sun className="mr-2 h-4 w-4" />
              Mode clair
              {theme === 'light' && (
                <div className="ml-auto">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                </div>
              )}
            </button>
            <button
              onClick={() => changeTheme('dark')}
              className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Moon className="mr-2 h-4 w-4" />
              Mode sombre
              {theme === 'dark' && (
                <div className="ml-auto">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                </div>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Composant Dropdown
const Dropdown = ({ trigger, children, align = "end" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-gray-800 dark:ring-gray-700 ${
              align === 'end' ? 'right-0' : 'left-0'
            }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          photoURL: user.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/auth/register");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const routes = [
    {
      href: "/dashboard",
      label: "Tableau de bord",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/tasks",
      label: "Mes tâches",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      href: "/calendar",
      label: "Calendrier",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      href: "/team",
      label: "Équipe",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/settings",
      label: "Paramètres",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Animations
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 30
      }
    },
    exit: { x: -300, opacity: 0, transition: { duration: 0.2 } }
  };

  const navItemVariants = {
    hover: { 
      scale: 1.02,
      backgroundColor: "rgba(79, 70, 229, 0.1)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 md:px-6 shadow-sm bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center justify-center rounded-lg border p-2 md:hidden border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 md:ml-0">
          <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold hidden md:inline-block text-gray-900 dark:text-white">TaskFlow</span>
        </Link>

        <div className="flex-1"></div>

        <div className="flex items-center gap-3">
          <Dropdown
            trigger={
              <button className="relative inline-flex items-center justify-center rounded-lg border p-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                  3
                </span>
              </button>
            }
          >
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vos dernières notifications</p>
              </div>
              <div className="max-h-80 overflow-auto">
                <div className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Nouvelle tâche assignée</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">"Préparer la présentation" vous a été assignée</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Il y a 10 minutes</p>
                </div>
                <div className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Rappel d'échéance</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">"Réviser le budget" est à échéance demain</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Il y a 1 heure</p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button className="w-full px-4 py-2 text-center text-sm transition-colors text-indigo-600 hover:bg-gray-50 dark:text-indigo-400 dark:hover:bg-gray-700">
                  Marquer toutes comme lues
                </button>
              </div>
            </div>
          </Dropdown>

          <ModeToggle />

          {user && (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Avatar
                    src={user.photoURL}
                    alt={user.name}
                    fallback={user.name.charAt(0).toUpperCase()}
                  />
                  <span className="hidden md:flex items-center">
                    <span className="text-sm font-medium mr-1 text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </span>
                </button>
              }
            >
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Mon profil
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </Dropdown>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block fixed top-16 left-0 bottom-0 w-64 border-r bg-white/90 dark:bg-gray-800/90 dark:border-gray-700 overflow-y-auto backdrop-blur-sm z-20 transition-all duration-300">
          <div className="flex flex-col gap-1 p-4 h-full">
            <nav className="grid gap-1">
              {routes.map((route) => {
                const isActive = location.pathname === route.href;
                return (
                  <motion.div
                    key={route.href}
                    variants={navItemVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      to={route.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400 font-medium"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      <span className={`${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}>
                        {route.icon}
                      </span>
                      {route.label}
                      {isActive && (
                        <motion.span 
                          className="ml-auto h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </motion.button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.aside
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl dark:bg-gray-800 z-50"
              >
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <CheckCircle className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-lg text-gray-900 dark:text-white">TaskFlow</span>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-1 p-4 h-[calc(100%-64px)]">
                  <nav className="grid gap-1">
                    {routes.map((route) => {
                      const isActive = location.pathname === route.href;
                      return (
                        <motion.div
                          key={route.href}
                          variants={navItemVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Link
                            to={route.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all ${
                              isActive
                                ? "bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400 font-medium"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span className={`${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}>
                              {route.icon}
                            </span>
                            {route.label}
                            {isActive && (
                              <motion.span 
                                className="ml-auto h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                  
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      onClick={() => {
                        logout();
                        setSidebarOpen(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-5 w-5" />
                      Déconnexion
                    </motion.button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto md:ml-64 transition-all duration-300">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}