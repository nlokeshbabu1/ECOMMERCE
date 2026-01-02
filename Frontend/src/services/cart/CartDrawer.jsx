import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = window.API_BASE_URL || '';

const CartDrawer = ({
  t,
  cartOpen,
  setCartOpen,
  cartItems = [],
  removeFromCart,
  addToCart,
  getTotalPrice,
  showPopup,
  setCartItems,
  sessionId,
  products,
  convertPrice,
  currencySymbol,
  currencyCode,
}) => {
  // This effect syncs the cart with the backend when it opens
  useEffect(() => {
    const syncCartWithBackend = async () => {
      if (sessionId && cartOpen) {
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
        } catch (err) {
          showPopup(t('failedToLoadCart'), 'error');
        }
      }
    };
    syncCartWithBackend();

  }, [sessionId, cartOpen, products]);

  // Get the navigate function from React Router
  const navigate = useNavigate();

  const handleClose = () => {
    // Check if there is a focused element and blur it.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setCartOpen(false);
  };

  // This is the new handler function for the button
  const handleCheckout = () => {
    handleClose();
    //     setCartOpen(false); // First, close the cart drawer
    navigate('/checkout'); // Then, navigate to the checkout page
  };

  const currentTotalPrice = getTotalPrice();

  return (
    // This className handles the slide-in/slide-out animation
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Overlay */}
      {cartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30 backdrop-blur-sm"
          onClick={handleClose}
        ></div>
      )}
      
      <div className='relative z-40 h-full flex flex-col bg-white'>
        <div className='p-6 h-full flex flex-col'>
          <div className='flex justify-between items-center mb-6 pb-4 border-b border-gray-200'>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className='text-2xl font-bold text-gray-900'>{t('yourCart')}</h2>
            </div>
            <button 
              className='text-gray-500 hover:text-gray-700 transition-colors duration-300'
              onClick={() => setCartOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className='text-gray-700 text-lg mb-2'>{t('noItemsInCart')}</p>
              <p className="text-gray-500">Add some items to your cart to get started</p>
            </div>
          ) : (
            <div className='flex-grow overflow-y-auto pr-2'>
              {cartItems.map((item) => (
                item && item.product && (
                  <div key={item.product._id} className='flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300'>
                    <div className="flex items-center">
                      <img 
                        src={item.product.image || 'https://placehold.co/80x80/EEEEEE/000000?text=No+Image'} 
                        alt={item.product.name} 
                        className='w-16 h-16 object-cover rounded-md mr-4 border border-gray-200'
                      />
                      <div>
                        <p className='text-gray-900 font-semibold text-sm'>{item.product.name}</p>
                        <p className='text-green-600 text-sm font-medium'>{currencySymbol}{convertPrice(item.product.price, currencyCode)}</p>
                      </div>
                    </div>
                    
                    <div className='flex items-center space-x-3'>
                      <div className='flex items-center border border-gray-300 rounded-lg'>
                        <button 
                          className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors duration-300'
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className='w-10 h-8 flex items-center justify-center text-gray-900 font-medium'>{item.quantity}</span>
                        <button 
                          className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors duration-300'
                          onClick={() => addToCart(item.product._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      
                      <button 
                        className='text-red-500 hover:text-red-700 transition-colors duration-300'
                        onClick={() => removeFromCart(item.product._id)}
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          <div className='mt-auto pt-6 border-t border-gray-200'>
            <div className='flex justify-between items-center text-xl font-bold text-gray-900 mb-6 pb-2'>
              <span>{t('total')}:</span>
              <span className='text-2xl text-purple-700 font-bold'>{currencySymbol}{convertPrice(currentTotalPrice, currencyCode)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg ${
                cartItems.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-0.5'
              }`}
            >
              {t('proceedToCheckout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;