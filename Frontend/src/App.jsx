import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id'));
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // For emoji effect
  const [focusField, setFocusField] = useState(null);

  // For add product
  const [addMode, setAddMode] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });

  const API_URL = 'http://localhost:5000';

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      localStorage.setItem('session_id', res.data.session_id);
      setSessionId(res.data.session_id);
      setLoginError(false);
    } catch (err) {
      setLoginError(true);
      new Audio('https://www.soundjay.com/human/sounds/scream-01.mp3').play();
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/api/register`, { email, password });
      alert('Registered successfully. Please log in.');
      setIsRegistering(false);
    } catch (err) {
      alert('Registration failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_id');
    setSessionId(null);
    setCartItems([]);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products?category=${category}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const addToCart = (productId) => {
    const product = products.find((p) => p.id === productId || p._id === productId);
    if (product) {
      setCartItems([...cartItems, product]);
      setPopupMessage(`${product.name} added to cart!`);
      setPopupVisible(true);
      new Audio('https://www.soundjay.com/button/beep-07.wav').play();
      setTimeout(() => setPopupVisible(false), 2000);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => (item.id || item._id) !== productId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  useEffect(() => {
    if (sessionId) fetchProducts();
  }, [sessionId, category]);

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  // Emoji face logic
  const getEmoji = () => {
    if (focusField === "password" || password.length > 0) {
      return "😑";
    }
    return "🙂";
  };

  // Add Product Handlers
  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    // Simple validation
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setPopupMessage('Please fill in all required fields!');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      return;
    }
    try {
      await axios.post(`${API_URL}/api/products`, {
        ...newProduct,
        price: parseFloat(newProduct.price)
      }, {
        headers: { 'Authorization': sessionId }
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
        image: ''
      });
      fetchProducts();
    } catch (err) {
      setPopupMessage('Failed to add product!');
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://i.postimg.cc/3rnCRvyS/istockphoto-941302930-612x612.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70 z-0" />
        <div className="relative z-10 bg-black/60 backdrop-blur-xl border border-orange-800 p-10 rounded-2xl shadow-2xl w-full max-w-md text-white">
          {/* Emoji face above login */}
          <div style={{ display: "flex", justifyContent: "center", fontSize: "2rem", marginBottom: "0.5rem" }}>
            <span>{getEmoji()} <span style={{ fontSize: "1rem", color: "#ff9800" }}>@{email || "username"}</span></span>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">
            {isRegistering ? 'Register' : 'Login'}
          </h2>
          <input
            className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-4 w-full mb-4 rounded-md"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusField("email")}
            onBlur={() => setFocusField(null)}
          />
          <input
            className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-4 w-full mb-4 rounded-md"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField("password")}
            onBlur={() => setFocusField(null)}
          />
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white w-full py-4 rounded-md font-bold text-lg"
            onClick={isRegistering ? handleRegister : handleLogin}
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
          <p className="text-center text-sm text-orange-200 mt-4">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="text-orange-300 underline hover:text-orange-100"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Login here' : 'Register here'}
            </button>
          </p>

          {loginError && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white text-center p-6 rounded-2xl animate-pulse z-10">
              <img src="https://i.postimg.cc/SQTP0QMw/download.jpg" alt="Ghost" className="w-32 h-32 animate-bounce mb-4" />
              <p className="text-lg font-semibold text-red-400">Wrong password... 👻</p>
              <p className="text-sm mt-1 text-orange-200">The Halloween spirit has awakened!</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  // 🎃 Main Dashboard
  return (
    <div className="min-h-screen bg-cover bg-center text-white relative"
      style={{
        backgroundImage: `url('https://i.postimg.cc/hjB2qRXH/ecommerce-blog-featured-image.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-80" />
      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-orange-400">🎃 Clothing Store</h1>
          <div className="flex items-center gap-4">
            <button
              className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700"
              onClick={() => setCartOpen(!cartOpen)}
            >
              🛒 {cartItems.length}
            </button>
            <button
              className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800"
              onClick={() => setAddMode(true)}
            >
              + Add Product
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <select
            className="bg-black text-white border border-orange-700 p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id || p._id}
              className="border border-orange-800 p-4 rounded-lg bg-black/40 hover:scale-105 transition-transform"
            >
              <img
                src={p.image || 'https://via.placeholder.com/150'}
                alt={p.name}
                className="w-full h-40 object-cover rounded mb-2"
                onClick={() => setSelectedProduct(p)}
              />
              <h3
                className="text-lg font-bold text-orange-300 cursor-pointer"
                onClick={() => setSelectedProduct(p)}
              >
                {p.name}
              </h3>
              <p className="text-sm text-orange-200">{p.description}</p>
              <p className="text-green-400 font-bold mt-2">${p.price}</p>
              <button
                className="bg-green-600 text-white mt-2 px-3 py-1 rounded hover:bg-green-700"
                onClick={() => addToCart(p.id || p._id)}
              >
                Add to Cart
              </button>
              <button
                className="bg-blue-600 text-white mt-2 ml-2 px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => alert('Buying now: ' + p.name)}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Modal for Product Preview */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-black p-6 rounded-lg border border-orange-700 max-w-md w-full">
              <img
                src={selectedProduct.image || 'https://via.placeholder.com/300'}
                alt={selectedProduct.name}
                className="w-full h-60 object-cover rounded mb-4"
              />
              <h2 className="text-2xl font-bold text-orange-400 mb-2">{selectedProduct.name}</h2>
              <p className="text-orange-200 mb-2">{selectedProduct.description}</p>
              <p className="text-green-400 text-lg font-bold mb-4">${selectedProduct.price}</p>
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 mr-2"
                onClick={() => addToCart(selectedProduct.id || selectedProduct._id)}
              >
                Add to Cart
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {addMode && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <form
              className="bg-black p-8 rounded-2xl border border-orange-600 shadow-2xl max-w-md w-full"
              onSubmit={handleAddProduct}
            >
              <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">Add New Product</h2>
              <input
                className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-3 w-full mb-3 rounded"
                type="text"
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleAddProductChange}
                required
              />
              <input
                className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-3 w-full mb-3 rounded"
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
                className="bg-white/10 text-white border border-orange-700 p-3 w-full mb-3 rounded"
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
                className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-3 w-full mb-3 rounded"
                type="text"
                name="image"
                placeholder="Image URL"
                value={newProduct.image}
                onChange={handleAddProductChange}
              />
              <textarea
                className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-3 w-full mb-3 rounded"
                name="description"
                placeholder="Description"
                value={newProduct.description}
                onChange={handleAddProductChange}
              />
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-800"
                  onClick={() => setAddMode(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-700 px-4 py-2 rounded text-white hover:bg-green-800"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cart Drawer */}
        {cartOpen && (
          <div className="mt-8 p-4 bg-black/60 border border-orange-700 rounded-lg">
            <h2 className="text-xl font-bold text-orange-300 mb-4">🛒 Your Cart</h2>
            {cartItems.length === 0 ? (
              <p className="text-orange-200">No items in the cart.</p>
            ) : (
              <>
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-2 border-b border-orange-800 pb-2"
                  >
                    <div>
                      <p className="text-orange-100">{item.name}</p>
                      <p className="text-green-300 text-sm">${item.price}</p>
                    </div>
                    <button
                      className="text-red-400 hover:text-red-600 text-sm"
                      onClick={() => removeFromCart(item.id || item._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="text-right text-lg font-bold text-green-400 mt-4">
                  Total: ${getTotalPrice().toFixed(2)}
                </div>
              </>
            )}
          </div>
        )}

        {/* 🔔 Popup Notification */}
        {popupVisible && (
          <div className="fixed top-6 right-6 z-50 bg-green-700 text-white px-6 py-3 rounded shadow-lg transition transform animate-bounce">
            {popupMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;