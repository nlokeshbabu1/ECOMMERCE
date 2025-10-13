import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// --- Production-Ready Backend API Endpoint ---
const API_URL = window.API_BASE_URL === '__API_URL__' ? 'http://localhost:5000' : window.API_BASE_URL;

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
  en: { flag: '🇬🇧', name: 'English', storeName: 'Modern Clothing Store', loginRegister: 'Login / Register', signOut: 'Sign Out', addProduct: '+ Add Product', yourCart: 'Your Cart', total: 'Total', proceedToCheckout: 'Proceed to Checkout', noItemsInCart: 'No items in the cart.', addToCart: 'Add to Cart', buyNow: 'Buy Now', loadingProducts: 'Loading products...', allCategories: 'All Categories', men: 'Men', women: 'Women', kids: 'Kids', searchProducts: 'Search products...', close: 'Close', settings: 'Settings', orders: 'Orders', itemAddedToCart: ' added to cart!', itemRemovedFromCart: 'Item removed from cart.', failedToFetchProducts: 'Failed to fetch products', failedToLoadCart: 'Could not load cart.', sellerRegisteredSuccessLogin: 'Seller registered successfully! Please login.', sellerRegistrationFailed: 'Seller registration failed!', /* ... other keys */ },
  // ... other languages
};

// --- Lazy-Loaded Components ---
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const ProductDetailsModal = lazy(() => import('./components/ProductDetailsModal'));
const AddProductModal = lazy(() => import('./components/AddProductModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const ProductGrid = lazy(() => import('./components/ProductGrid'));

// --- UI Components ---
const FullScreenSpinner = () => ( <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[101]"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div> );
const ProductGridSkeleton = () => ( <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="border border-gray-200 p-4 rounded-lg bg-white/70 animate-pulse"><div className="w-full h-40 bg-gray-300 rounded mb-2"></div><div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div><div className="h-4 bg-gray-300 rounded w-full mb-4"></div><div className="h-8 bg-gray-300 rounded w-1/2"></div></div>)}</div> );
const GlobalPopup = ({ message, visible, setVisible, type = 'success' }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, setVisible]);
    if (!visible) return null;
    const bgColorClass = type === 'error' ? 'bg-red-600' : 'bg-green-600';
    return ( <div className={`fixed top-6 right-6 z-[100] ${bgColorClass} text-white px-6 py-3 rounded shadow-lg transition transform animate-bounce`}>{message}</div> );
};
const GlobalStyles = () => ( <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .spinner { border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #fff; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; } .animated-background { background: linear-gradient(270deg, #f0f0f0, #ffffff, #f0f0f0); background-size: 200% 200%; animation: gradient-animation 15s ease infinite; } @keyframes gradient-animation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style> );


// --- Layout Component ---
// This component provides the consistent header and footer for every page.
function MainLayout({ t, language, setLanguage, currency, setCurrency, sessionId, cartItems, setCartOpen, setShowLoginModal, handleLogout, setShowSettingsModal }) {
  return (
    <div className='relative z-10 p-4 max-w-7xl mx-auto flex flex-col min-h-screen'>
      <header className='flex justify-between items-center mb-8 bg-white/80 backdrop-blur-lg p-4 rounded-xl shadow-md border border-gray-200 sticky top-4 z-20'>
        <Link to="/" className='text-3xl font-extrabold text-purple-700'>🛍️ {t('storeName')}</Link>
        <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">Contact</Link>
        </nav>
        <div className='flex items-center gap-3'>
            <select className='bg-gray-100 text-gray-800 border-transparent p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' value={language} onChange={(e) => setLanguage(e.target.value)}>
                {Object.keys(translations).map((langKey) => (<option key={langKey} value={langKey}>{translations[langKey].flag}</option>))}
            </select>
            {sessionId ? (
              <>
                <button className='bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300 transition' onClick={() => setShowSettingsModal(true)}>⚙️</button>
                <button className='relative bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition' onClick={() => setCartOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {cartItems.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                </button>
                <button className='bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition' onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </>
            ) : (
              <button className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg transition' onClick={() => setShowLoginModal(true)}>{t('loginRegister')}</button>
            )}
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className='w-full text-center py-6 mt-8'>
        <p className="text-gray-500">&copy; {new Date().getFullYear()} {t('storeName')}. All rights reserved.</p>
      </footer>
    </div>
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
    try {
      await axios.post(`${API_URL}/api/selleregister`, {
        email,
        password,
        SellerName: sellerName,
        SellerPhone: sellerPhone,
        SellerGSTNumber: sellerGSTNumber,
        SellerAddress: sellerAddress,
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
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <GlobalStyles />
      <GlobalPopup message={popupMessage} visible={popupVisible} setVisible={setPopupVisible} type={popupType} />
      
      <div className='relative z-10 p-4 max-w-7xl mx-auto'>
        <header className='flex justify-between items-center mb-4 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-md border border-gray-300'>
          <h1 className='text-2xl font-bold text-gray-900'>🛍️ {t('storeName')}</h1>
          <div className='flex items-center gap-2 md:gap-4'>
            <select className='bg-white text-gray-900 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Select language">
              {Object.keys(translations).map((langKey) => (<option key={langKey} value={langKey}>{translations[langKey].flag} {translations[langKey].name}</option>))}
            </select>
            <select className='bg-white text-gray-900 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Select currency">
              {Object.keys(currencies).map((code) => (<option key={code} value={code}>{currencies[code].symbol} {code}</option>))}
            </select>
            {sessionId ? (
              <>
                <button className='bg-gray-200 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-300' onClick={() => setShowSettingsModal(true)}>⚙️</button>
                {userRole !== 'seller' && (<button className='relative bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700' onClick={() => setCartOpen(true)}>🛒{cartItems.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>}</button>)}
                {userRole === 'seller' && (<button className='bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700' onClick={() => setAddMode(true)}>{t('addProduct')}</button>)}
                <button className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600' onClick={handleLogout}>{t('signOut')}</button>
              </>
            ) : (
              <button className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl' onClick={() => setShowLoginModal(true)}>{t('loginRegister')}</button>
            )}
          </div>
        </header>

        <main>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
                t={t} products={products} setSelectedProduct={setSelectedProduct} category={category} setCategory={setCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isLoading={isLoading} currentPage={currentPage} totalPages={totalPages} handlePageChange={setCurrentPage} convertPrice={convertPrice} currencySymbol={currencySymbol} currencyCode={currency} addToCart={addToCart} handleBuyNow={handleBuyNow}
              />
          </Suspense>
        </main>
      </div>
      
      <Suspense fallback={<FullScreenSpinner />}>
        {showLoginModal && <AuthModal t={t} setShowLoginModal={setShowLoginModal} handleLogin={handleLogin} handleRegister={handleRegister} handleSellerRegister={handleSellerRegister} email={email} setEmail={setEmail} password={password} setPassword={setPassword} isRegistering={isRegistering} setIsRegistering={setIsRegistering} showSellerRegisterModal={showSellerRegisterModal} setShowSellerRegisterModal={setShowSellerRegisterModal} sellerName={sellerName} setSellerName={setSellerName} sellerPhone={sellerPhone} setSellerPhone={setSellerPhone} sellerGSTNumber={sellerGSTNumber} setSellerGSTNumber={setSellerGSTNumber} sellerAddress={sellerAddress} setSellerAddress={sellerAddress} showPopup={showPopup} />}
        {selectedProduct && <ProductDetailsModal t={t} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} addToCart={addToCart} handleBuyNow={handleBuyNow} convertPrice={convertPrice} currencySymbol={currencySymbol} currencyCode={currency} sessionId={sessionId} showPopup={showPopup} />}
        {addMode && <AddProductModal t={t} addMode={addMode} setAddMode={setAddMode} newProduct={newProduct} setNewProduct={setNewProduct} submitAddProduct={submitAddProduct} />}
        <CartDrawer t={t} cartOpen={cartOpen} setCartOpen={setCartOpen} cartItems={cartItems} setCartItems={setCartItems} removeFromCart={removeFromCart} addToCart={addToCart} getTotalPrice={getTotalPrice} showPopup={showPopup} products={products} sessionId={sessionId} convertPrice={convertPrice} currencySymbol={currencySymbol} currencyCode={currency} />
        {showSettingsModal && <SettingsModal t={t} showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal} userEmail={userEmail} userRole={userRole} />}
      </Suspense>

      <footer className='w-full text-center py-4 bg-white/70 backdrop-blur-sm text-gray-700 mt-8 rounded-lg shadow-md border border-gray-300'>
        <p>&copy; {new Date().getFullYear()} Modern Clothing Store. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;