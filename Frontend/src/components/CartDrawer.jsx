import React, { useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  const currentTotalPrice = getTotalPrice();

  return (
    // This className handles the slide-in/slide-out animation
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white/90 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!cartOpen}
    >
      <div className='p-6 h-full flex flex-col'>
        <div className='flex justify-between items-center mb-6 pb-4 border-b border-gray-300'>
          <h2 className='text-2xl font-bold text-gray-900'>🛒 {t('yourCart')}</h2>
          <button className='text-red-600 hover:text-red-800 text-3xl font-bold' onClick={() => setCartOpen(false)}>&times;</button>
        </div>

        {cartItems.length === 0 ? (
          <p className='text-gray-700 flex-grow text-center flex items-center justify-center'>{t('noItemsInCart')}</p>
        ) : (
          <div className='flex-grow overflow-y-auto pr-2'>
            {cartItems.map((item) => (
              item && item.product && (
                <div key={item.product._id} className='flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3 shadow-md'>
                  <img src={item.product.image || 'https://placehold.co/50'} alt={item.product.name} className='w-16 h-16 object-cover rounded-md mr-3' />
                  <div className='flex-grow'>
                    <p className='text-gray-900 font-semibold'>{item.product.name}</p>
                    <p className='text-green-600 text-sm'>{currencySymbol}{convertPrice(item.product.price, currencyCode)}</p>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <button className='bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center' onClick={() => removeFromCart(item.product._id)}>-</button>
                    <span className='text-lg font-bold text-gray-900'>{item.quantity}</span>
                    <button className='bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center' onClick={() => addToCart(item.product._id)}>+</button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        <div className='mt-auto pt-4 border-t border-gray-300'>
          <div className='flex justify-between items-center text-xl font-bold text-gray-900 mb-4'>
              <span>{t('total')}:</span>
              <span className='text-green-600'>{currencySymbol}{convertPrice(currentTotalPrice, currencyCode)}</span>
          </div>
          <button className='w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700' onClick={() => showPopup("Checkout not implemented.", "info")}>
              {t('proceedToCheckout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;