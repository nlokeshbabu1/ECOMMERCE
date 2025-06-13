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

  const API_URL = 'http://localhost:5000';

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });
      localStorage.setItem('session_id', res.data.session_id);
      setSessionId(res.data.session_id);
      setLoginError(false);
    } catch (err) {
      setLoginError(true);
      const audio = new Audio('https://www.soundjay.com/human/sounds/scream-01.mp3');
      audio.play();
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

    // 5 second exit for login error overlay
    useEffect(() => {
      if (loginError) {
        const timer = setTimeout(() => {
          setLoginError(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [loginError]);

    

  if (!sessionId) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${loginError ? 'bg-black' : 'bg-gradient-to-r from-orange-900 via-black to-purple-900'}`}>
        <div className="relative bg-black/60 backdrop-blur-xl border border-orange-800 p-10 rounded-2xl shadow-2xl w-full max-w-md text-white">
          <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">
            {isRegistering ? 'Register' : 'Login'}
          </h2>
          <input
            className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-4 w-full mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="bg-white/10 text-white placeholder-orange-300 border border-orange-700 p-4 w-full mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              <img src="ghost.png" alt="Halloween Ghost" className="w-32 h-32 animate-bounce mb-4" />
              <p className="text-lg font-semibold text-red-400">Wrong password... 👻</p>
              <p className="text-sm mt-1 text-orange-200">The Halloween spirit has awakened!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-orange-900 via-black to-purple-900 min-h-screen text-white">
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
          <option value="men">men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id || p._id} className="border border-orange-800 p-4 rounded-lg bg-black/40 hover:scale-105 transition-transform">
            <img
              src={p.image || 'https://via.placeholder.com/150'}
              alt={p.name}
              className="w-full h-40 object-cover rounded mb-2"
              onClick={() => setSelectedProduct(p)}
            />
            <h3 className="text-lg font-bold text-orange-300 cursor-pointer" onClick={() => setSelectedProduct(p)}>{p.name}</h3>
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

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg border border-orange-700 max-w-md w-full">
            <img src={selectedProduct.image || 'https://via.placeholder.com/300'} alt={selectedProduct.name} className="w-full h-60 object-cover rounded mb-4" />
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

      {cartOpen && (
        <div className="mt-8 p-4 bg-black/60 border border-orange-700 rounded-lg">
          <h2 className="text-xl font-bold text-orange-300 mb-4">🛒 Your Cart</h2>
          {cartItems.length === 0 ? (
            <p className="text-orange-200">No items in the cart.</p>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-2 border-b border-orange-800 pb-2">
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
    </div>
  );
}

export default App;
