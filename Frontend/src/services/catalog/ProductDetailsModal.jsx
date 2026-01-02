import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductDetailsModal = ({ t, selectedProduct, setSelectedProduct, addToCart, handleBuyNow, convertPrice, currencySymbol, currencyCode, products }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  
  const API_URL = window.API_BASE_URL || '';

  useEffect(() => {
    if (selectedProduct) {
      setLoadingRecommendations(true);
      setError(null);
      
      // Fetch recommendations for the selected product
      axios.get(`${API_URL}/api/products/${selectedProduct._id}/recommendations`)
        .then(response => {
          setRecommendations(response.data.recommendations);
          setLoadingRecommendations(false);
        })
        .catch(err => {
          console.error('Error fetching recommendations:', err);
          setError('Failed to load recommendations');
          setLoadingRecommendations(false);
        });
    }
  }, [selectedProduct, API_URL]);

  if (!selectedProduct) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className='fixed inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
    >
      <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full text-gray-900 overflow-hidden transform transition-all duration-300 scale-95 animate-in fade-in-90 zoom-in-95'>
        <div className="relative">
          <img
            src={selectedProduct.image || 'https://placehold.co/300x200/EEEEEE/000000?text=No+Image'}
            alt={selectedProduct.name}
            className='w-full h-64 object-cover'
          />
          <button
            className='absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-300'
            onClick={() => setSelectedProduct(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>{selectedProduct.name}</h2>
          <p className='text-gray-600 mb-4'>{selectedProduct.description}</p>
          
          <div className='flex items-center justify-between mb-4'>
            <p className='text-2xl font-bold text-purple-700'>
              {currencySymbol}{convertPrice(selectedProduct.price, currencyCode)}
            </p>
            
            {selectedProduct.stockAvailable !== undefined && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedProduct.stockAvailable > 10 
                  ? 'bg-green-100 text-green-800' 
                  : selectedProduct.stockAvailable > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {selectedProduct.stockAvailable > 0 ? `${selectedProduct.stockAvailable} left` : 'Out of stock'}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {selectedProduct.category && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {selectedProduct.category}
              </span>
            )}
            {selectedProduct.size && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Size: {selectedProduct.size}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md flex items-center justify-center'
              onClick={() => {
                addToCart(selectedProduct._id);
                setSelectedProduct(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('addToCart')}
            </button>
            
            <button
              className='flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md flex items-center justify-center'
              onClick={() => handleBuyNow(selectedProduct)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('buyNow')}
            </button>
          </div>
        </div>
        
        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              You might also like
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recommendations.slice(0, 6).map((product) => (
                <div 
                  key={product._id}
                  className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow duration-300"
                  onClick={() => {
                    setSelectedProduct(product);
                  }}
                >
                  <img
                    src={product.image || 'https://placehold.co/100x100/EEEEEE/000000?text=No+Image'}
                    alt={product.name}
                    className="w-full h-20 object-cover rounded-md mb-2"
                  />
                  <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                  <p className="text-sm text-purple-700 font-bold">
                    {currencySymbol}{convertPrice(product.price, currencyCode)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {loadingRecommendations && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Loading recommendations...</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg p-3">
                  <div className="bg-gray-300 rounded w-full h-20 mb-2"></div>
                  <div className="bg-gray-300 rounded w-3/4 h-4 mb-1"></div>
                  <div className="bg-gray-300 rounded w-1/2 h-4"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsModal;