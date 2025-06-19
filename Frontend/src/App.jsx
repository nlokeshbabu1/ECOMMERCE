import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Initialize sessionId and userRole from localStorage, defaulting to null if not found
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role')); // New state for user role

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // For regular user registration
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
    image: ''
  });

  // States for new seller registration fields
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerGSTNumber, setSellerGSTNumber] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');

  // API base URL - IMPORTANT: Ensure this matches your backend's accessible URL.
  const API_URL = 'http://localhost:5000/';
  
  // No longer need localhost warning as API_URL is explicitly set to a non-localhost address.

  /**
   * Handles user login by sending credentials to the backend.
   * On success, stores the session ID and user role in localStorage and state.
   * On failure, sets loginError state and plays an error sound.
   */
  const handleLogin = async () => {
    try {
      const _res = await axios.post(`${API_URL}/api/login`, { email, password });
      localStorage.setItem('session_id', res.data.session_id);
      localStorage.setItem('user_role', res.data.role); // Store user role from backend
      setSessionId(res.data.session_id);
      setUserRole(res.data.role); // Set user role in state
      setLoginError(false); // Clear any previous login errors
      setShowLoginModal(false); // Close login modal on successful login
    } catch (err) {
      console.error('Login failed:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/login`);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      setLoginError(true); // Indicate login error
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
      // Assuming backend /api/register assigns a default 'user' role if none specified
      await axios.post(`${API_URL}/api/register`, { email, password });
      setPopupMessage('Registered successfully. Please log in.');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setIsRegistering(false); // Switch back to login view
      // No need to close showLoginModal here, as user still needs to login
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/register`);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
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
   * IMPORTANT: The backend's /api/register endpoint needs to be updated to accept
   * these new fields and assign the 'admin' role based on this registration.
   */
  const handleSellerRegister = async () => {
    try {
      // Sending 'role: admin' and other seller-specific details to the registration endpoint.
      // Your backend must handle this 'role' and actually set the user as admin.
      const res = await axios.post(`${API_URL}/api/register`, {
        email,
        password,
        name: sellerName,
        phone: sellerPhone,
        gst_number: sellerGSTNumber, // Use snake_case for backend consistency
        address: sellerAddress,
        role: 'admin' // Frontend requesting 'admin' role for this registration
      });
      setPopupMessage('Seller registered successfully! Please login.');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setShowSellerRegisterModal(false); // Close seller registration modal
      // After registration, the user still needs to log in, so keep showLoginModal true
      setEmail(''); // Clear form fields
      setPassword('');
      setSellerName('');
      setSellerPhone('');
      setSellerGSTNumber('');
      setSellerAddress('');
      console.warn("Note: For seller registration to grant 'admin' access, your backend's /api/register endpoint must be configured to process the 'role: admin' field and assign it in the database.");
    } catch (err) {
      console.error('Seller registration failed:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/register`);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
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
    localStorage.removeItem('user_role'); // Clear user role on logout
    setSessionId(null);
    setUserRole(null); // Clear user role in state
    setCartItems([]); // Clear cart on logout
    setShowLoginModal(false); // User is logged out, so they are back to guest view, login modal can be closed initially
  };

  /**
   * Fetches products from the backend, optionally filtered by category.
   * This function is called on component mount and when category changes.
   */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products?category=${category}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/products?category=${category}`);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      setPopupMessage(`Failed to fetch products. Please check your backend server at ${API_URL}`);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 5000);
    }
  };

  // Effect hook to fetch products on initial load and when category changes
  useEffect(() => {
    fetchProducts();
  }, [category]); // sessionId is no longer a dependency for fetching products

  // Effect hook to hide login error message after a delay
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(false), 5000);
      return () => clearTimeout(timer); // Cleanup timer on unmount or if loginError changes
    }
  }, [loginError]);

  /**
   * Adds a product to the shopping cart.
   * If not logged in, prompts for login.
   * @param {string} productId - The ID of the product to add.
   */
  const addToCart = (productId) => {
    if (!sessionId) {
      setPopupMessage('Please log in to add items to your cart.');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setShowLoginModal(true); // Show login modal
      return;
    }
    const product = products.find((p) => p.id === productId || p._id === productId);
    if (product) {
      setCartItems([...cartItems, product]); // Add product to cart state
      setPopupMessage(`${product.name} added to cart!`); // Set popup message
      setPopupVisible(true); // Show popup
      try {
        new Audio('https://www.soundjay.com/button/beep-07.wav').play(); // Play sound
      } catch (audioErr) {
        console.warn("Failed to play audio:", audioErr);
      }
      setTimeout(() => setPopupVisible(false), 2000); // Hide popup after 2 seconds
    }
  };

  /**
   * Removes a product from the shopping cart.
   * @param {string} productId - The ID of the product to remove.
   */
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => (item.id || item._id) !== productId));
  };

  /**
   * Calculates the total price of all items in the cart.
   * @returns {number} - The total price.
   */
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  /**
   * Determines the emoji to display based on input field focus and password content.
   * - Rotating eyes (👀) when the email field is focused.
   * - Covered eyes (🙈) when there's content in the password field.
   * - Otherwise, a neutral face.
   */
  const getEmoji = () => {
    if (focusField === "email") {
      return "👀"; // Eyes rotating when email field is focused
    } else if (focusField === "password" && password.length > 0) {
      return "🙈"; // Eyes covered when typing password
    }
    // Default case: neutral face for other scenarios
    return "🙂";
  };

  /**
   * Handles changes in the "Add Product" form fields.
   * @param {Object} e - The event object from the input change.
   */
  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles the submission of the "Add Product" form.
   * Performs basic validation and sends product data to the backend.
   */
  const handleAddProduct = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    // Simple validation for required fields
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setPopupMessage('Please fill in all required fields!');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      return;
    }
    try {
      // Send new product data to the API with session_id in the body
      await axios.post(`${API_URL}/api/addproduct`, { // Changed endpoint to /api/addproduct
        ...newProduct,
        price: parseFloat(newProduct.price), // Ensure price is a number
        session_id: sessionId // Pass session_id in the body as required by backend
      });
      setPopupMessage('Product added successfully!');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setAddMode(false); // Exit add product mode
      // Reset new product form fields
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
      });
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error('Failed to add product:', err);
      console.error('Backend URL attempted:', `${API_URL}/api/addproduct`);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      // Display specific error message from backend if available, otherwise a generic one
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
    <div className="min-h-screen bg-cover bg-center text-white relative" 
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1517404215737-0248c823028d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, 
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-80" /> {/* Darker background overlay */}
      <div className="relative z-10 p-4">
        {/* Header with App Title and Action Buttons */}
        <div className="flex justify-between items-center mb-4 bg-gray-900/70 backdrop-blur-sm p-4 rounded-lg shadow-md border border-gray-700"> 
          <h1 className="text-2xl font-bold text-white">🛍️ Modern Clothing Store</h1> 
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

        {/* Category Filter */}
        <div className="flex gap-4 items-center mb-4 bg-gray-900/70 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-700"> 
          <select
            className="bg-gray-800 text-white border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
            value={category}
            onChange={(e) => setCategory(e.target.value)} // Update category filter
          >
            <option value="">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
        </div>

        {/* Products Grid - Visible to all users (logged-in or guest) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id || p._id} // Use either id or _id as key
              className="border border-gray-700 p-4 rounded-lg bg-gray-900/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200" 
            >
              <img
                src={p.image || 'https://via.placeholder.com/150/222222/FFFFFF?text=No+Image'} 
                alt={p.name}
                className="w-full h-40 object-cover rounded mb-2 cursor-pointer"
                onClick={() => setSelectedProduct(p)} // Open product details modal
              />
              <h3
                className="text-lg font-bold text-white cursor-pointer" 
                onClick={() => setSelectedProduct(p)} // Open product details modal
              >
                {p.name}
              </h3>
              <p className="text-sm text-gray-300">{p.description}</p> 
              <p className="text-green-400 font-bold mt-2">${p.price}</p> 
              <button
                className="bg-blue-600 text-white mt-2 px-3 py-1 rounded hover:bg-blue-700 transition duration-200"
                onClick={() => addToCart(p.id || p._id)} // Add to cart button (triggers login if not logged in)
              >
                Add to Cart
              </button>
              <button
                className="bg-gray-700 text-white mt-2 ml-2 px-3 py-1 rounded hover:bg-gray-800 transition duration-200"
                onClick={() => {
                  if (!sessionId) { // If not logged in, prompt for login
                    setPopupMessage('Please log in to purchase this item.');
                    setPopupVisible(true);
                    setTimeout(() => setPopupVisible(false), 2000);
                    setShowLoginModal(true);
                    return;
                  }
                  setPopupMessage('Buying now: ' + p.name + ' - Feature coming soon!');
                  setPopupVisible(true);
                  try {
                    new Audio('https://www.soundjay.com/misc/sounds/pop.mp3').play();
                  } catch (audioErr) {
                    console.warn("Failed to play audio:", audioErr);
                  }
                  setTimeout(() => setPopupVisible(false), 2000);
                }}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Modal for Product Preview */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md w-full text-white"> 
              <img
                src={selectedProduct.image || 'https://via.placeholder.com/300/222222/FFFFFF?text=No+Image'}
                alt={selectedProduct.name}
                className="w-full h-60 object-cover rounded mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h2>
              <p className="text-gray-300 mb-2">{selectedProduct.description}</p>
              <p className="text-green-400 text-lg font-bold mb-4">${selectedProduct.price}</p>
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
                  addToCart(selectedProduct.id || selectedProduct._id);
                  setSelectedProduct(null); // Close modal after adding to cart
                }}
              >
                Add to Cart
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                onClick={() => setSelectedProduct(null)} // Close product details modal
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {addMode && userRole === 'admin' && ( // Only show "Add Product" modal if user is admin
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <form
              className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full text-white" 
              onSubmit={handleAddProduct}
            >
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Add New Product</h2>
              <input
                className="bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                type="text"
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleAddProductChange}
                required
              />
              <input
                className="bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
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
                className="bg-gray-800 text-white border border-gray-600 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
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
                className="bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                type="text"
                name="image"
                placeholder="Image URL"
                value={newProduct.image}
                onChange={handleAddProductChange}
              />
              <textarea
                className="bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-3 w-full mb-3 rounded resize-y" 
                name="description"
                placeholder="Description"
                value={newProduct.description}
                onChange={handleAddProductChange}
              />
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200" 
                  onClick={() => setAddMode(false)} // Cancel adding product
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

        {/* Cart Drawer/Section */}
        {cartOpen && (
          <div className="mt-8 p-4 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-lg shadow-md text-white"> 
            <h2 className="text-xl font-bold text-white mb-4">🛒 Your Cart</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-300">No items in the cart.</p> 
            ) : (
              <>
                {cartItems.map((item, index) => (
                  <div
                    key={item.id || item._id || index} // Using index as key, consider unique IDs if available
                    className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2" 
                  >
                    <div>
                      <p className="text-gray-100">{item.name}</p> 
                      <p className="text-green-400 text-sm">${item.price}</p> 
                    </div>
                    <button
                      className="text-red-400 hover:text-red-600 text-sm transition duration-200" 
                      onClick={() => removeFromCart(item.id || item._id)} // Remove from cart
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="text-right text-lg font-bold text-green-400 mt-4"> 
                  Total: ${getTotalPrice().toFixed(2)} {/* Display total price */}
                </div>
              </>
            )}
          </div>
        )}

        {/* 🔔 Popup Notification */}
        {popupVisible && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg transition transform animate-bounce">
            {popupMessage}
          </div>
        )}
      </div>

      {/* Login/Register Modal (appears over the content when needed) */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-80 z-50">
          <div className="relative z-10 w-full max-w-sm p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden md:p-10">
            <button
              className="absolute top-4 right-4 text-white text-xl"
              onClick={() => setShowLoginModal(false)} // Close the modal
            >
              &times;
            </button>
            {/* Conditional rendering for regular login/register or seller register */}
            {showSellerRegisterModal ? (
              // Seller Registration Form
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-purple-400 drop-shadow-lg">
                  Seller Registration
                </h2>
                <input
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-4"
                  type="text"
                  placeholder="Name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
                <input
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-4"
                  type="text"
                  placeholder="Phone"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
                <input
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-4"
                  type="text"
                  placeholder="GST Number"
                  value={sellerGSTNumber}
                  onChange={(e) => setSellerGSTNumber(e.target.value)}
                  required
                />
                <textarea
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-4 resize-y"
                  placeholder="Address"
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  required
                ></textarea>
                <input
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-4"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => setFocusField(null)}
                  required
                />
                <input
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-6"
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
                  className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 mt-3"
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
                  <span>{getEmoji()} <span className="text-xl text-purple-400 ml-2">@{email || "username"}</span></span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-purple-400 drop-shadow-lg">
                  {isRegistering ? 'Register' : 'Login'}
                </h2>
                <input
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-4"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => setFocusField(null)}
                />
                <input
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/50 text-white transition duration-300 ease-in-out mb-6"
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
                <p className="text-center text-sm text-white/70 mt-4">
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    className="text-purple-400 hover:text-purple-300 font-medium transition duration-300 ease-in-out"
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

            {/* Login Error Popup (Halloween themed) */}
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
