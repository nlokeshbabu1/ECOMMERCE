import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Link, Outlet, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// --- Production-Ready Backend API Endpoint ---
// Use relative path for API calls to allow ingress routing in cluster
// This allows the ingress to route /api/* requests to the backend service
// const API_URL = window.API_BASE_URL === '__API_URL__' ? 'http://localhost:5000' : 
//                window.API_BASE_URL;

//const API_URL = window.API_BASE_URL || '';

// --- Configuration & Helpers ---
const exchangeRates = {
  USD: 1.0, INR: 83.5, EUR: 0.93, JPY: 156.5, KRW: 1380.0, CNY: 7.25,
};
const currencies = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  KRW: { symbol: '₩', name: 'South Korean Won' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
};
const convertPrice = (price, targetCurrencyCode) => {
    const basePriceUSD = parseFloat(price);
    if (isNaN(basePriceUSD)) return price;
    const rate = exchangeRates[targetCurrencyCode] || 1;
    return (basePriceUSD * rate).toFixed(2);
};
const translations = {
  en: { 
    flag: '🇬🇧', 
    name: 'English', 
    storeName: 'Modern Clothing Stores', 
    loginRegister: 'Login / Register', 
    signOut: 'Sign Out', 
    addProduct: '+ Add Product', 
    addProductButton: 'Add Product', 
    yourCart: 'Your Cart', 
    total: 'Total', 
    proceedToCheckout: 'Proceed to Checkout', 
    noItemsInCart: 'No items in the cart.', 
    addToCart: 'Add to Cart', 
    buyNow: 'Buy Now', 
    loadingProducts: 'Loading products...', 
    allCategories: 'All Categories', 
    men: 'Men', 
    women: 'Women', 
    kids: 'Kids', 
    searchProducts: 'Search products...', 
    close: 'Close', 
    settings: 'Settings', 
    orders: 'Orders', 
    itemAddedToCart: ' added to cart!', 
    itemRemovedFromCart: 'Item removed from cart.', 
    failedToFetchProducts: 'Failed to fetch products', 
    failedToLoadCart: 'Could not load cart.', 
    sellerRegisteredSuccessLogin: 'Seller registered successfully! Please login.', 
    sellerRegistrationFailed: 'Seller registration failed!',
    selectLanguage: 'Select language',
    selectCurrency: 'Select currency',
    welcome: 'Welcome!',
    previous: 'Previous',
    next: 'Next',
    page: 'Page'
   },
  // ... other languages
};

// --- Lazy-Loaded Components ---
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const ProductDetailsModal = lazy(() => import('./components/ProductDetailsModal'));
const AddProductModal = lazy(() => import('./components/AddProductModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const ProductGrid = lazy(() => import('./components/ProductGrid'));
const Chatbot = lazy(() => import('./components/Chatbot'));

// --- UI Components ---
const FullScreenSpinner = () => ( 
  <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center z-[101]">
    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
  </div> 
);

const ProductGridSkeleton = () => ( 
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse shadow-sm">
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

const GlobalPopup = ({ message, visible, setVisible, type = 'success' }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, setVisible]);
    if (!visible) return null;
    const bgColorClass = type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600';
    return ( 
      <div className={`fixed top-6 right-6 z-[100] ${bgColorClass} text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-center">
          {type === 'error' ? (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )}
          <span>{message}</span>
        </div>
      </div> 
    );
};

// --- Modern Layout Component ---
function ModernHeader({ t, language, setLanguage, currency, setCurrency, sessionId, userRole, cartItems, setCartOpen, setShowLoginModal, handleLogout, setShowSettingsModal, setAddMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' : 'bg-white/70 backdrop-blur-sm py-3'} border-b border-gray-200`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className='text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'>
              🛍️ {t('storeName')}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300 relative group">
              {t('welcome')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300 relative group">
              {t('about', 'About')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300 relative group">
              {t('contact', 'Contact')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <label className="flex flex-col">
              <span className="text-xs text-gray-600 mb-1">{t('selectLanguage')}</span>
              <select 
                className='bg-gray-100 text-gray-800 border-transparent p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300'
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
              >
                {Object.keys(translations).map((langKey) => (
                  <option key={langKey} value={langKey}>
                    {translations[langKey].flag} {translations[langKey].name}
                  </option>
                ))}
              </select>
            </label>
            
            {/* Currency Selector */}
            <label className="flex flex-col">
              <span className="text-xs text-gray-600 mb-1">{t('selectCurrency')}</span>
              <select 
                className='bg-gray-100 text-gray-800 border-transparent p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300'
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
                {Object.keys(currencies).map((code) => (
                  <option key={code} value={code}>{currencies[code].symbol} {code}</option>
                ))}
              </select>
            </label>
            
            {/* Mobile Menu Button - only visible on mobile */}
            <button 
              className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            {/* Auth buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {sessionId ? (
                <>
                  <button 
                    className='p-2 rounded-full hover:bg-purple-100 text-purple-700 transition-all duration-300 relative group'
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  <button 
                    className='relative p-2 rounded-full hover:bg-purple-100 text-purple-700 transition-all duration-300 group'
                    onClick={() => setCartOpen(true)}
                    aria-label="Cart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                  
                  {userRole === 'seller' && (
                    <button 
                      className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md'
                      onClick={() => setAddMode(true)}
                    >
                      {t('addProduct')}
                    </button>
                  )}
                  
                  <button 
                    className='bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-md'
                    onClick={handleLogout}
                  >
                    {t('signOut')}
                  </button>
                </>
              ) : (
                <button 
                  className='bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md'
                  onClick={() => setShowLoginModal(true)}
                >
                  {t('loginRegister')}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu - only visible on mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-purple-600 font-medium py-2 transition-colors duration-300" 
                onClick={() => setIsMenuOpen(false)}
              >
                {t('welcome')}
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-purple-600 font-medium py-2 transition-colors duration-300" 
                onClick={() => setIsMenuOpen(false)}
              >
                {t('about', 'About')}
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-purple-600 font-medium py-2 transition-colors duration-300" 
                onClick={() => setIsMenuOpen(false)}
              >
                {t('contact', 'Contact')}
              </Link>
              
              {sessionId ? (
                <>
                  <button 
                    className="text-left text-gray-700 hover:text-purple-600 font-medium py-2 transition-colors duration-300"
                    onClick={() => {
                      setShowSettingsModal(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    {t('settings')}
                  </button>
                  {userRole === 'seller' && (
                    <button 
                      className="text-left bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                      onClick={() => {
                        setAddMode(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      {t('addProduct')}
                    </button>
                  )}
                  <button 
                    className="text-left bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300"
                    onClick={handleLogout}
                  >
                    {t('signOut')}
                  </button>
                </>
              ) : (
                <button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMenuOpen(false);
                  }}
                >
                  {t('loginRegister')}
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('session_id'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('user_role'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('user_email'));
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerGSTNumber, setSellerGSTNumber] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSellerRegisterModal, setShowSellerRegisterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: '', image: '', stockAvailable: '', size: '' });
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const totalPages = Math.ceil(totalProductsCount / productsPerPage);
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');
  const t = (key) => translations[language]?.[key] || key;
  const currencySymbol = currencies[currency]?.symbol || '₹';

  // --- HELPER & API FUNCTIONS ---
  const showPopup = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };
  
  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products`, {
        params: { category, q: searchQuery, page, limit: productsPerPage, session_id: userRole === 'seller' ? sessionId : undefined }
      });
      const productData = res.data.products || (Array.isArray(res.data) ? res.data : []);
      const totalCount = res.data.total_count || productData.length;
      setProducts(productData.map(p => ({...p, _displayId: p._id})));
      setTotalProductsCount(totalCount);
    } catch (err) {
      showPopup(t('failedToFetchProducts'), 'error');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      localStorage.setItem('session_id', res.data.session_id);
      localStorage.setItem('user_role', res.data.role);
      localStorage.setItem('user_email', res.data.user_email);
      setSessionId(res.data.session_id);
      setUserRole(res.data.role);
      setUserEmail(res.data.user_email);
      setShowLoginModal(false);
      showPopup('Login successful!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      showPopup(errorMessage, 'error');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/api/register`, { email, password });
      showPopup('Registered successfully! Please log in.', 'success');
      setIsRegistering(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      showPopup(errorMessage, 'error');
    }
  };

  const handleSellerRegister = async () => {
    // Validate that address is not empty or just whitespace
    const trimmedAddress = sellerAddress.trim();
    if (!trimmedAddress) {
      showPopup('Address is required', 'error');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/selleregister`, {
        email,
        password,
        SellerName: sellerName,
        SellerPhone: sellerPhone,
        SellerGSTNumber: sellerGSTNumber,
        SellerAddress: trimmedAddress,
      });
      showPopup(t('sellerRegisteredSuccessLogin'), 'success');
      setShowSellerRegisterModal(false);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
      setSellerName('');
      setSellerPhone('');
      setSellerGSTNumber('');
      setSellerAddress('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('sellerRegistrationFailed');
      showPopup(errorMessage, 'error');
    }
  };
  
  const submitAddProduct = async () => {
    const { name, price, category, stockAvailable, size } = newProduct;
    if (!name || !price || !category || stockAvailable === '' || !size) {
      showPopup('Please fill in all required fields!', 'error');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/addproducts`, {
        ...newProduct,
        session_id: sessionId,
      });
      showPopup('Product added successfully!', 'success');
      setAddMode(false);
      setNewProduct({ name: '', description: '', price: '', category: '', image: '', stockAvailable: '', size: '' });
      fetchProducts(1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add product!';
      showPopup(errorMessage, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setSessionId(null);
    setUserRole(null);
    setUserEmail(null);
    setCartItems([]);
    showPopup('Logged out successfully!');
  };

  const handleBuyNow = (product) => {
    if (!sessionId) return showPopup('Please log in to purchase.', 'error');
    showPopup(`Purchased ${product.name}!`, 'success');
  };

  const fetchCart = async () => {
    if (!sessionId) return;
    try {
      const res = await axios.get(`${API_URL}/api/cart/${sessionId}`);
      const backendCartData = res.data;
      const detailedCartItems = await Promise.all(
        Object.keys(backendCartData).map(async (productId) => {
          const product = products.find(p => p._id === productId);
          return product ? { product, quantity: backendCartData[productId] } : null;
        })
      );
      setCartItems(detailedCartItems.filter(Boolean));
    } catch (error) {
      showPopup(t('failedToLoadCart'), 'error');
    }
  };

  const addToCart = async (productId) => {
    if (!sessionId) return showPopup('Please log in to add items to your cart.', 'error');
    const productToAdd = products.find(p => p._id === productId);
    try {
      await axios.post(`${API_URL}/api/cart`, { session_id: sessionId, product_id: productId, quantity: 1 });
      showPopup(`${productToAdd.name} ${t('itemAddedToCart')}`, 'success');
      await fetchCart();
    } catch (err) {
      showPopup('Failed to add item to cart.', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    if (!sessionId) return showPopup('Please log in to manage your cart.', 'error');
    try {
      await axios.delete(`${API_URL}/api/cart`, { data: { session_id: sessionId, product_id: productId } });
      showPopup(t('itemRemovedFromCart'), 'info');
      await fetchCart();
    } catch (err) {
      showPopup('Failed to remove item from cart.', 'error');
    }
  };

  const getTotalPrice = () => cartItems.reduce((total, item) => (item && item.product ? total + item.product.price * item.quantity : total), 0);

  // --- EFFECTS ---
  useEffect(() => {
    const handler = setTimeout(() => {
        setCurrentPage(1);
        fetchProducts(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [category, searchQuery, userRole, sessionId, language]);

  useEffect(() => {
    if (currentPage > 1) {
        fetchProducts(currentPage);
    }
  }, [currentPage]);
  
  useEffect(() => {
    if (sessionId && products.length > 0) {
        fetchCart();
    }
  }, [sessionId, products]);

  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  useEffect(() => { localStorage.setItem('currency', currency); }, [currency]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'>
      <GlobalPopup message={popupMessage} visible={popupVisible} setVisible={setPopupVisible} type={popupType} />
      
      <ModernHeader 
        t={t} 
        language={language} 
        setLanguage={setLanguage} 
        currency={currency} 
        setCurrency={setCurrency} 
        sessionId={sessionId} 
        userRole={userRole}
        cartItems={cartItems} 
        setCartOpen={setCartOpen} 
        setShowLoginModal={setShowLoginModal} 
        handleLogout={handleLogout} 
        setShowSettingsModal={setShowSettingsModal}
        setAddMode={setAddMode}
      />

      <main className="container mx-auto px-4 py-6 flex-grow">
        <Suspense fallback={<ProductGridSkeleton />}>
          {window.location.pathname === '/checkout' ? (
            <CheckoutPage 
              t={t} 
              cartItems={cartItems} 
              getTotalPrice={getTotalPrice} 
              currencySymbol={currencySymbol} 
              showPopup={showPopup} 
              sessionId={sessionId}
            />
          ) : window.location.pathname === '/orders' ? (
            <OrdersPage 
              t={t} 
              sessionId={sessionId} 
              showPopup={showPopup} 
            />
          ) : (
            <ProductGrid
              t={t} 
              products={products} 
              setSelectedProduct={setSelectedProduct} 
              category={category} 
              setCategory={setCategory} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              isLoading={isLoading} 
              currentPage={currentPage} 
              totalPages={totalPages} 
              handlePageChange={setCurrentPage} 
              convertPrice={convertPrice} 
              currencySymbol={currencySymbol} 
              currencyCode={currency} 
              addToCart={addToCart} 
              handleBuyNow={handleBuyNow}
              sessionId={sessionId}
            />
          )}
        </Suspense>
      </main>

      <footer className='w-full py-8 bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12'>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                🛍️ {t('storeName')}
              </h3>
              <p className="text-gray-600 mt-2">Your premier destination for fashion</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">&copy; {new Date().getFullYear()} {t('storeName')}. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <Suspense fallback={<FullScreenSpinner />}>
        {showLoginModal && <AuthModal t={t} setShowLoginModal={setShowLoginModal} handleLogin={handleLogin} handleRegister={handleRegister} handleSellerRegister={handleSellerRegister} email={email} setEmail={setEmail} password={password} setPassword={setPassword} isRegistering={isRegistering} setIsRegistering={setIsRegistering} showSellerRegisterModal={showSellerRegisterModal} setShowSellerRegisterModal={setShowSellerRegisterModal} sellerName={sellerName} setSellerName={setSellerName} sellerPhone={sellerPhone} setSellerPhone={setSellerPhone} sellerGSTNumber={sellerGSTNumber} setSellerGSTNumber={setSellerGSTNumber} sellerAddress={sellerAddress} setSellerAddress={setSellerAddress} showPopup={showPopup} />}
        {selectedProduct && <ProductDetailsModal t={t} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} addToCart={addToCart} handleBuyNow={handleBuyNow} convertPrice={convertPrice} currencySymbol={currencySymbol} currencyCode={currency} sessionId={sessionId} showPopup={showPopup} products={products} />}
        {addMode && <AddProductModal t={t} addMode={addMode} setAddMode={setAddMode} newProduct={newProduct} setNewProduct={setNewProduct} submitAddProduct={submitAddProduct} />}
        <CartDrawer t={t} cartOpen={cartOpen} setCartOpen={setCartOpen} cartItems={cartItems} setCartItems={setCartItems} removeFromCart={removeFromCart} addToCart={addToCart} getTotalPrice={getTotalPrice} showPopup={showPopup} products={products} sessionId={sessionId} convertPrice={convertPrice} currencySymbol={currencySymbol} currencyCode={currency} />
        {showSettingsModal && <SettingsModal t={t} showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal} userEmail={userEmail} userRole={userRole} handleLogout={handleLogout} sessionId={sessionId} showPopup={showPopup} />}
        <Chatbot sessionId={sessionId} userEmail={userEmail} />
      </Suspense>
    </div>
  );
}

export default App;
