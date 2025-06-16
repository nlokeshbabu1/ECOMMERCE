import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define keyframe animation and base styles here for the background and elements
const GlobalStyles = () => (
  <style>
    {`
    @keyframes gradient-animation {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .animated-background {
      /* Changed to very light, almost white gradient for an animated white background */
      background: linear-gradient(270deg, #f0f0f0, #ffffff, #f0f0f0);
      background-size: 200% 200%; /* Make gradient larger to allow for movement */
      animation: gradient-animation 15s ease infinite; /* Apply the animation */
    }

    /* New animation for elements sliding in from the bottom */
    @keyframes slide-in-up {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-in-up {
      animation: slide-in-up 0.5s ease-out forwards;
    }

    /* Staggered animation for grid items */
    .product-item {
        opacity: 0; /* Initially hidden */
        animation: slide-in-up 0.5s ease-out forwards; /* Apply the base animation */
    }
    .product-item:nth-child(1) { animation-delay: 0.1s; }
    .product-item:nth-child(2) { animation-delay: 0.15s; }
    .product-item:nth-child(3) { animation-delay: 0.2s; }
    .product-item:nth-child(4) { animation-delay: 0.25s; }
    .product-item:nth-child(5) { animation-delay: 0.3s; }
    .product-item:nth-child(6) { animation-delay: 0.35s; }
    .product-item:nth-child(7) { animation-delay: 0.4s; }
    .product-item:nth-child(8) { animation-delay: 0.45s; }
    .product-item:nth-child(9) { animation-delay: 0.5s; }
    .product-item:nth-child(10) { animation-delay: 0.55s; }
    .product-item:nth-child(11) { animation-delay: 0.6s; }
    .product-item:nth-child(12) { animation-delay: 0.65s; }
    .product-item:nth-child(13) { animation-delay: 0.7s; }
    .product-item:nth-child(14) { animation-delay: 0.75s; }
    .product-item:nth-child(15) { animation-delay: 0.8s; }
    /* Add more nth-child rules for more products if needed */
    `}
  </style>
);


function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Initialize sessionId, userRole, and sellerEmail from localStorage, defaulting to null if not found
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role')); 
  const [sellerEmail, setSellerEmail] = useState(localStorage.getItem('user_email')); // New state for seller's email

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [loginError, setLoginError] = useState(false);
  const [cartItems, setCartItems] = useState([]); 
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State for the custom popup notification
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState(''); 

  // State for the emoji effect in login
  const [focusField, setFocusField] = useState(null);

  // State to control seller registration modal visibility
  const [showSellerRegisterModal, setShowSellerRegisterModal] = useState(false);
  // State to control the main login/register modal visibility when not logged in or action requires login
  const [showLoginModal, setShowLoginModal] = useState(false);


  // States for adding a new product
  const [addMode, setAddMode] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stockAvailable: '', 
    size: '' 
  });

  // States for new seller registration fields
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerGSTNumber, setSellerGSTNumber] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');

  // API base URL - IMPORTANT: Ensure this matches your backend's accessible URL.
  const API_URL = 'http://localhost:5000/';
  

  /**
   * Handles user login by sending credentials to the backend.
   * On success, stores the session ID, user role, and user email in localStorage and state.
   * On failure, sets loginError state and plays an error sound.
   */
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      localStorage.setItem('session_id', res.data.session_id);
      localStorage.setItem('user_role', res.data.role); 
      localStorage.setItem('user_email', res.data.user_email); // Store user email
      setSessionId(res.data.session_id);
      setUserRole(res.data.role); 
      setSellerEmail(res.data.user_email); // Set seller email in state
      setShowLoginModal(false); 
    } catch (err) {
      console.error('Login failed:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/login`);
      if (axios.isAxiosError(err)) { 
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error message:', err.message);
        }
      } else {
        console.error('Non-Axios error:', err);
      }
      setLoginError(true); 
      setPopupMessage(`Login failed: ${err.message}. Please check your backend server at ${API_URL}`);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 5000);
      try {
        new Audio('https://www.soundjay.com/human/sounds/scream-01.mp3').play();
      } catch (audioErr) {
        console.warn("Failed to play audio:", audioErr);
      }
    }
  };

  /**
   * Handles regular user registration by sending credentials to the backend.
   * On success, shows a success message and switches to login mode.
   * On failure, shows a registration failed message.
   */
  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/api/register`, { email, password });
      setPopupMessage('Registered successfully. Please log in.');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setIsRegistering(false); 
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/register`);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error message:', err.message);
        }
      } else {
        console.error('Non-Axios error:', err);
      }
      const errorMessage = err.response && err.response.data && err.response.data.error
                           ? err.response.data.error
                           : `Registration failed! Please check your backend server at ${API_URL}`;
      setPopupMessage(errorMessage);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 5000);
    }
  };

  /**
   * Handles seller registration by sending additional credentials to the backend.
   */
  const handleSellerRegister = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/selleregister`, {
        email,
        password,
        SellerName: sellerName,
        SellerPhone: sellerPhone,
        SellerGSTNumber: sellerGSTNumber, 
        SellerAddres: sellerAddress,
      });
      setPopupMessage('Seller registered successfully! Please login.');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setShowSellerRegisterModal(false); 
      setEmail(''); 
      setPassword('');
      setSellerName(''); // Corrected variable name from setsellerName
      setSellerPhone('');
      setSellerGSTNumber('');
      setSellerAddress('');
    } catch (err) {
      console.error('Seller registration failed:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/selleregister`);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error message:', err.message);
        }
      } else {
        console.error('Non-Axios error:', err);
      }
      const errorMessage = err.response && err.response.data && err.response.data.error
                           ? err.response.data.error
                           : `Seller registration failed! Please check your backend server at ${API_URL}`;
      setPopupMessage(errorMessage);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 5000);
    }
  };

  /**
   * Handles user logout by removing the session ID and user role from localStorage and state.
   * Also clears the cart items.
   */
  const handleLogout = () => {
    localStorage.removeItem('session_id');
    localStorage.removeItem('user_role'); 
    localStorage.removeItem('user_email'); // Clear user email on logout
    setSessionId(null);
    setUserRole(null); 
    setSellerEmail(null); // Clear seller email in state
    setCartItems([]); 
    setShowLoginModal(false); 
  };

  /**
   * Fetches products from the backend, optionally filtered by category and search query.
   * If a seller is logged in, it will filter products by their email.
   */
  const fetchProducts = async () => {
    try {
      let url = `${API_URL}/api/products?category=${category}&q=${searchQuery}`;
      
      // If a seller is logged in, append their email to the query
      if (userRole === 'admin' && sellerEmail) {
        url += `&seller_email=${sellerEmail}`;
      }

      const res = await axios.get(url);
      
      // Ensure each product has a unique, reliable ID for frontend use
      const processedProducts = res.data.map(product => ({
        ...product,
        // Map backend's 'image' directly to frontend's 'image'
        image: product.image || 'https://via.placeholder.com/150/222222/FFFFFF?text=No+Image',
        // Corrected: Map backend's 'stockavailable' (lowercase 's') to frontend's 'stockAvailable' (camelCase)
        stockAvailable: parseInt(product.stockavailable), 
        // Added: Map backend's 'size' to frontend's 'size'
        size: product.size,
        // Use existing _id (from MongoDB) or generate a more compatible UUID as fallback for _displayId
        _displayId: product._id || (Date.now().toString() + Math.random().toString(36).substring(2))
      }));
      setProducts(processedProducts);
      console.log('Fetched products from backend. Processed products with _displayId:', processedProducts);
      processedProducts.forEach((product, index) => {
        console.log(`Product in state ${index}: Name=${product.name}, _id=${product._id}, _displayId=${product._displayId}, Stock: ${product.stockAvailable}, Size: ${product.size}`);
      });

    } catch (err) {
      console.error('Error fetching products:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/products?category=${category}&q=${searchQuery}`);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          setPopupMessage(`Failed to fetch products: ${err.response.data.error || err.response.statusText}. Please check your backend server at ${API_URL}`);
        } else if (err.request) {
          console.error('No response received:', err.request);
          setPopupMessage(`Failed to fetch products: No response from server. Is your backend running at ${API_URL}?`);
        } else {
          console.error('Error message:', err.message);
          setPopupMessage(`Failed to fetch products: An unexpected error occurred.`);
        }
      } else {
        console.error('Non-Axios error:', err);
        setPopupMessage(`Failed to fetch products: An unexpected error occurred.`);
      }
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 5000);
    }
  };

  // Effect hook to fetch products on initial load and when category, search query, or userRole/sellerEmail changes
  useEffect(() => {
    fetchProducts();
  }, [category, searchQuery, userRole, sellerEmail]); 


  // Effect hook to hide login error message after a delay
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(false), 5000);
      return () => clearTimeout(timer); 
    }
  }, [loginError]);

  /**
   * Adds a product to the shopping cart.
   * If not logged in, prompts for login.
   * If logged in, checks stock and adds/updates quantity.
   * @param {string} displayId - The unique display ID of the product to add.
   */
  const addToCart = (displayId) => {
    console.log('Attempting to add product with _displayId:', displayId);
    if (!sessionId) {
      setPopupMessage('Please log in to add items to your cart.');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setShowLoginModal(true); 
      return;
    }
    // Find the product using the _displayId
    const productToAdd = products.find((p) => p._displayId === displayId);
    console.log('Product found from products array:', productToAdd);

    if (!productToAdd) {
      console.error('Product not found in available products for _displayId:', displayId);
      return; 
    }

    const existingCartItemIndex = cartItems.findIndex(
      (item) => item.product._displayId === displayId
    );

    // Check if there's enough stock
    if (productToAdd.stockAvailable !== undefined && productToAdd.stockAvailable !== null) {
      const currentQuantityInCart = existingCartItemIndex !== -1 ? cartItems[existingCartItemIndex].quantity : 0;
      if (currentQuantityInCart >= productToAdd.stockAvailable) {
        setPopupMessage(`Out of stock for ${productToAdd.name} or maximum available added.`);
        setPopupVisible(true);
        try {
          new Audio('https://www.soundjay.com/error/sounds/error-01.wav').play(); 
        } catch (audioErr) {
          console.warn("Failed to play audio:", audioErr);
        }
        setTimeout(() => setPopupVisible(false), 2000);
        return;
      }
    }


    if (existingCartItemIndex !== -1) {
      // Product already in cart, increment quantity
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingCartItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
      setPopupMessage(`Another ${productToAdd.name} added to cart!`);
    } else {
      // Product not in cart, add new with quantity 1
      setCartItems([...cartItems, { product: productToAdd, quantity: 1, cartItemId: (Date.now().toString() + Math.random().toString(36).substring(2)) }]); 
      setPopupMessage(`${productToAdd.name} added to cart!`);
    }
    
    setPopupVisible(true); 
    try {
      new Audio('https://www.soundjay.com/button/beep-07.wav').play(); 
    } catch (audioErr) {
      console.warn("Failed to play audio:", audioErr);
    }
    setTimeout(() => setPopupVisible(false), 2000); 
  };

  /**
   * Removes a product from the shopping cart. Decrements quantity or removes item entirely.
   * @param {string} displayId - The unique display ID of the product to remove.
   */
  const removeFromCart = (displayId) => {
    const existingCartItemIndex = cartItems.findIndex(
      (item) => item.product._displayId === displayId
    );

    if (existingCartItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      if (updatedCartItems[existingCartItemIndex].quantity > 1) {
        updatedCartItems[existingCartItemIndex].quantity -= 1;
        setCartItems(updatedCartItems);
        setPopupMessage('Item quantity decreased.');
      } else {
        updatedCartItems.splice(existingCartItemIndex, 1); 
        setCartItems(updatedCartItems);
        setPopupMessage('Item removed from cart.');
      }
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
    }
  };

  /**
   * Handles the direct purchase of a product.
   * Decrements stock locally and shows confirmation.
   * @param {object} productToBuy - The product object to be purchased.
   */
  const handleBuyNow = (productToBuy) => {
    if (!sessionId) {
      setPopupMessage('Please log in to purchase items.');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setShowLoginModal(true); 
      return;
    }

    if (productToBuy.stockAvailable <= 0) {
      setPopupMessage(`Sorry, "${productToBuy.name}" is out of stock!`);
      setPopupVisible(true);
      try {
        new Audio('https://www.soundjay.com/error/sounds/error-01.wav').play(); 
      } catch (audioErr) {
        console.warn("Failed to play audio:", audioErr);
      }
      setTimeout(() => setPopupVisible(false), 3000);
      return;
    }

    // Decrement stock locally for immediate feedback
    const updatedProducts = products.map(p =>
      p._displayId === productToBuy._displayId
        ? { ...p, stockAvailable: p.stockAvailable - 1 }
        : p
    );
    setProducts(updatedProducts);
    setSelectedProduct(null); 

    setPopupMessage(`Successfully purchased 1x ${productToBuy.name}!`);
    setPopupVisible(true);
    try {
      new Audio('https://www.soundjay.com/misc/sounds/pop.mp3').play(); 
    } catch (audioErr) {
      console.warn("Failed to play audio:", audioErr);
    }
    setTimeout(() => setPopupVisible(false), 3000);

    // TODO: Implement backend API call to update stock in the database
    console.log(`Purchase of ${productToBuy.name} handled locally. REMINDER: Implement backend stock update!`);
  };


  /**
   * Calculates the total price of all items in the cart, considering quantities.
   * @returns {number} - The total price.
   */
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  /**
   * Determines the emoji to display based on input field focus and password content.
   * - Rotating eyes (👀) when the email field is focused.
   * - Covered eyes (🙈) when there's content in the password field.
   * - Otherwise, a neutral face.
   */
  const getEmoji = () => {
    if (focusField === "email") {
      return "👀"; 
    } else if (focusField === "password" && password.length > 0) {
      return "🙈"; 
    }
    // Default case: neutral face for other scenarios
    return "🙂"; // Changed from '�' to '🙂' for better emoji display compatibility
  };

  /**
   * Handles changes in the "Add Product" form fields.
   * @param {Object} e - The event object from the input change.
   */
  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stockAvailable' ? parseFloat(value) : value 
    }));
  };

  /**
   * Handles the submission of the "Add Product" form.
   * Performs basic validation and sends product data to the backend.
   */
  const handleAddProduct = async (e) => {
    e.preventDefault(); 
    if (!newProduct.name || !newProduct.price || !newProduct.category || newProduct.stockAvailable === '') {
      setPopupMessage('Please fill in all required fields!');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      return;
    }
    try {
      // Send new product data to the API with session_id in the body
      await axios.post(`${API_URL}/api/addproducts`, { 
        ...newProduct,
        price: parseFloat(newProduct.price), 
        stockAvailable: parseInt(newProduct.stockAvailable), 
        session_id: sessionId, // Pass session_id in the body as required by backend
      });
      setPopupMessage('Product added successfully!');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setAddMode(false); 
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stockAvailable: '',
        size: '' 
      });
      fetchProducts(); 
    } catch (err) {
      console.error('Failed to add product:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/addproducts`);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error message:', err.message);
        }
      } else {
        console.error('Non-Axios error:', err);
      }
      const errorMessage = err.response && err.response.data && err.response.data.error
                           ? err.response.data.error
                           : `Failed to add product! Please check your backend server at ${API_URL}`;
      setPopupMessage(errorMessage);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 5000);
    }
  };


  // Main Application Structure (always rendered)
  return (
    <div className="min-h-screen animated-background text-gray-900">
      {/* Include Global Styles for animations */}
      <GlobalStyles />
      <div className="relative z-10 p-4">
        {/* Header with App Title and Action Buttons */}
        <div className="flex justify-between items-center mb-4 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-md border border-gray-300"> 
          <h1 className="text-2xl font-bold text-gray-900">🛍️ Modern Clothing Store</h1> 
          <div className="flex items-center gap-4">
            {sessionId ? ( // If logged in, show cart and logout
              <>
                <button
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition duration-200"
                  onClick={() => setCartOpen(!cartOpen)} // Toggle cart visibility
                >
                  🛒 {cartItems.length} {/* Display number of items in cart */}
                </button>
                {userRole === 'admin' && ( // Only show "Add Product" button if user is admin
                  <button
                    className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition duration-200"
                    onClick={() => setAddMode(true)} // Open add product modal
                  >
                    + Add Product
                  </button>
                )}
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                  onClick={handleLogout} // Handle logout
                >
                  Sign Out
                </button>
              </>
            ) : ( // If not logged in, show a general Login button
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition duration-300"
                onClick={() => setShowLoginModal(true)}
              >
                Login / Register
              </button>
            )}
          </div>
        </div>

        {/* Category Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4 bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-300 animate-slide-in-up"> 
          <select
            className="bg-white text-gray-900 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto" 
            value={category}
            onChange={(e) => setCategory(e.target.value)} // Update category filter
          >
            <option value="">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
          <input
            type="text"
            placeholder="Search products..."
            className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products Grid - Visible to all users (logged-in or guest) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p._displayId} // Use the guaranteed unique _displayId as key
              className="border border-gray-300 p-4 rounded-lg bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200 product-item" 
            >
              <img
                src={p.image || 'https://via.placeholder.com/150/EEEEEE/000000?text=No+Image'} 
                alt={p.name}
                className="w-full h-40 object-cover rounded mb-2 cursor-pointer"
                onClick={() => setSelectedProduct(p)} // Open product details modal
              />
              <h3
                className="text-lg font-bold text-gray-900 cursor-pointer" 
                onClick={() => setSelectedProduct(p)} // Open product details modal
              >
                {p.name}
              </h3>
              <p className="text-sm text-gray-700">{p.description}</p> 
              <p className="text-green-600 font-bold mt-2">${p.price}</p> 
              {p.stockAvailable !== undefined && p.stockAvailable !== null && (
                <p className="text-sm text-gray-600 mt-1">Stock: {p.stockAvailable}</p>
              )}
              <button
                className="bg-blue-600 text-white mt-2 px-3 py-1 rounded hover:bg-blue-700 transition duration-200"
                onClick={() => {
                  console.log(`Clicked "Add to Cart" for product with _displayId: ${p._displayId}, Name: ${p.name}`); // More verbose diagnostic log
                  addToCart(p._displayId); // Pass the _displayId to addToCart
                }} 
              >
                Add to Cart
              </button>
              <button
                className="bg-gray-400 text-gray-900 mt-2 ml-2 px-3 py-1 rounded hover:bg-gray-500 transition duration-200"
                onClick={() => handleBuyNow(p)} // Call handleBuyNow
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Modal for Product Preview */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border border-gray-300 max-w-md w-full text-gray-900 animate-slide-in-up"> 
              <img
                src={selectedProduct.image || 'https://via.placeholder.com/300/EEEEEE/000000?text=No+Image'}
                alt={selectedProduct.name}
                className="w-full h-60 object-cover rounded mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
              <p className="text-gray-700 mb-2">{selectedProduct.description}</p>
              <p className="text-green-600 text-lg font-bold mb-4">${selectedProduct.price}</p>
              {/* Display stockAvailable in product details modal */}
              {selectedProduct.stockAvailable !== undefined && selectedProduct.stockAvailable !== null && (
                <p className="text-sm text-gray-600 mt-1">Stock: {selectedProduct.stockAvailable}</p>
              )}
              {/* Display size in product details modal */}
              {selectedProduct.size && (
                <p className="text-sm text-gray-600 mt-1">Size: {selectedProduct.size}</p>
              )}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2 transition duration-200"
                onClick={() => {
                  if (!sessionId) { // If not logged in, prompt for login
                    setPopupMessage('Please log in to add items to your cart.');
                    setPopupVisible(true);
                    setTimeout(() => setPopupVisible(false), 2000);
                    setShowLoginModal(true);
                    return;
                  }
                  addToCart(selectedProduct._displayId); 
                  setSelectedProduct(null); 
                }}
              >
                Add to Cart
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                onClick={() => setSelectedProduct(null)} 
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {addMode && userRole === 'admin' && ( 
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <form
              className="bg-white p-8 rounded-2xl border border-gray-300 shadow-2xl max-w-md w-full text-gray-900" 
              onSubmit={handleAddProduct}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Add New Product</h2>
              <input
                className="bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                type="text"
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleAddProductChange}
                required
              />
              <input
                className="bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                type="number"
                name="price"
                placeholder="Price"
                value={newProduct.price}
                onChange={handleAddProductChange}
                min="0"
                step="0.01"
                required
              />
              <select
                className="bg-gray-100 text-gray-900 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                name="category"
                value={newProduct.category}
                onChange={handleAddProductChange}
                required
              >
                <option value="">Select Category</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>
              <input
                className="bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                type="text"
                name="image"
                placeholder="Image URL"
                value={newProduct.image}
                onChange={handleAddProductChange}
              />
              <input
                className="bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                type="number"
                name="stockAvailable"
                placeholder="Stock Available"
                value={newProduct.stockAvailable}
                onChange={handleAddProductChange}
                min="0"
                step="1"
                required
              />
              <input 
                className="bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                type="text"
                name="size"
                placeholder="Size (e.g., S, M, L)"
                value={newProduct.size}
                onChange={handleAddProductChange}
              />
              <div className="flex items-center gap-2 mb-3">
                <textarea
                  className="bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full rounded resize-y" 
                  name="description"
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={handleAddProductChange}
                  rows="4" 
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="bg-gray-400 text-gray-900 px-4 py-2 rounded hover:bg-gray-500 transition duration-200" 
                  onClick={() => setAddMode(false)} 
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cart Drawer */}
        <div 
          className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white/90 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out z-40
            ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900">🛒 Your Cart</h2>
              <button
                className="text-red-600 hover:text-red-800 text-3xl font-bold"
                onClick={() => setCartOpen(false)}
              >
                &times;
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-700 flex-grow text-center flex items-center justify-center">No items in the cart.</p> 
            ) : (
              <div className="flex-grow overflow-y-auto pr-2"> 
                {cartItems.map((item) => ( 
                  <div
                    key={item.cartItemId} 
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3 shadow-md" 
                  >
                    <img 
                        src={item.product.image || 'https://via.placeholder.com/50/EEEEEE/000000?text=Item'} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded-md mr-3"
                    />
                    <div className="flex-grow">
                      <p className="text-gray-900 font-semibold">{item.product.name}</p> 
                      <p className="text-green-600 text-sm">${item.product.price.toFixed(2)}</p> 
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200" 
                        onClick={() => removeFromCart(item.product._displayId)} 
                      >
                        -
                      </button>
                      <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                      <button
                        className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition duration-200" 
                        onClick={() => addToCart(item.product._displayId)} 
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-auto pt-4 border-t border-gray-300"> 
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-4"> 
                    <span>Total:</span>
                    <span className="text-green-600">${getTotalPrice().toFixed(2)}</span> 
                </div>
                <button
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
                    onClick={() => {
                        if (cartItems.length > 0) {
                            setPopupMessage('Thank you for your purchase! Your order has been placed. (Frontend simulation)');
                            setPopupVisible(true);
                            try {
                                new Audio('https://www.soundjay.com/misc/sounds/pop.mp3').play();
                            } catch (audioErr) {
                                console.warn("Failed to play audio:", audioErr);
                            }
                            setCartItems([]); 
                            setCartOpen(false); 
                            setTimeout(() => setPopupVisible(false), 3000);
                            console.log('Checkout completed locally. REMINDER: Implement backend order processing and stock updates!');
                        } else {
                            setPopupMessage('Your cart is empty!');
                            setPopupVisible(true);
                            try {
                                new Audio('https://www.soundjay.com/error/sounds/error-01.wav').play();
                            } catch (audioErr) {
                                console.warn("Failed to play audio:", audioErr);
                            }
                            setTimeout(() => setPopupVisible(false), 2000);
                        }
                    }}
                >
                    Proceed to Checkout
                </button>
            </div>
          </div>
        </div>

        {/* 🔔 Popup Notification */}
        {popupVisible && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg transition transform animate-bounce">
            {popupMessage}
          </div>
        )}
      </div>

      {/* Login/Register Modal (appears over the content when needed) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative z-10 w-full max-w-sm p-8 bg-white/90 backdrop-blur-md border border-gray-300 rounded-3xl shadow-2xl overflow-hidden md:p-10">
            <button
              className="absolute top-4 right-4 text-gray-700 text-xl"
              onClick={() => setShowLoginModal(false)} 
            >
              &times;
            </button>
            {/* Conditional rendering for regular login/register or seller register */}
            {showSellerRegisterModal ? (
              // Seller Registration Form
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-purple-700 drop-shadow-lg">
                  Seller Registration
                </h2>
                <input
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4"
                  type="text"
                  placeholder="Name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
                <input
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4"
                  type="text"
                  placeholder="Phone"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
                <input
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4"
                  type="text"
                  placeholder="GST Number"
                  value={sellerGSTNumber}
                  onChange={(e) => setSellerGSTNumber(e.target.value)}
                  required
                />
                <textarea
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4 resize-y"
                  placeholder="Address"
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  required
                ></textarea>
                <input
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => setFocusField(null)}
                  required
                />
                <input
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-6"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  required
                />
                <button
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                  onClick={handleSellerRegister}
                >
                  Register as Seller
                </button>
                <button
                  className="w-full py-3 px-4 bg-gray-400 hover:bg-gray-500 text-gray-900 font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 mt-3"
                  onClick={() => setShowSellerRegisterModal(false)}
                >
                  Back to Login
                </button>
              </>
            ) : (
              // Regular Login/Register Form
              <>
                {/* Emoji face above login */}
                <div className="flex justify-center text-4xl mb-2">
                  <span className="text-gray-900">{getEmoji()} <span className="text-xl text-purple-700 ml-2">@{email || "username"}</span></span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-purple-700 drop-shadow-lg">
                  {isRegistering ? 'Register' : 'Login'}
                </h2>
                <input
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => setFocusField(null)}
                />
                <input
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-6"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                />
                <button
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                  onClick={isRegistering ? handleRegister : handleLogin}
                >
                  {isRegistering ? 'Register' : 'Login'}
                </button>
                <p className="text-center text-sm text-gray-700 mt-4">
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    className="text-purple-700 hover:text-purple-500 font-medium transition duration-300 ease-in-out"
                    onClick={() => setIsRegistering(!isRegistering)}
                  >
                    {isRegistering ? 'Login here' : 'Register here'}
                  </button>
                </p>
                <button
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 mt-4"
                  onClick={() => setShowSellerRegisterModal(true)}
                >
                  Register as Seller
                </button>
              </>
            )}

            {loginError && (
              <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white text-center p-6 rounded-2xl animate-pulse z-20"> 
                <img src="https://i.postimg.cc/SQTP0QMw/download.jpg" alt="Ghost" className="w-32 h-32 animate-bounce mb-4" />
                <p className="text-lg font-semibold text-red-400">Wrong password... 👻</p>
                <p className="text-sm mt-1 text-purple-200">The Halloween spirit has awakened!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
