import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm animate-pulse">
        <div className="w-full h-48 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl mb-4"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded mb-3 w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded mb-4 w-full"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-1/3"></div>
          <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

const ProductGrid = ({
  t,
  products,
  setSelectedProduct,
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
  isLoading,
  currentPage,
  totalPages,
  handlePageChange,
  convertPrice,
  currencySymbol,
  currencyCode,
  addToCart,
  sessionId
}) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const API_URL = window.API_BASE_URL || '';

  // Fetch personalized recommendations when component mounts
  useEffect(() => {
    if (!category && !searchQuery && currentPage === 1) { // Only fetch on homepage (no filters)
      setRecommendedLoading(true);
      
      let url = `${API_URL}/api/products/recommendations`;
      if (sessionId) {
        url += `?session_id=${sessionId}`;
      }
      
      axios.get(url)
        .then(response => {
          setRecommendedProducts(response.data.recommendations || []);
          setRecommendedLoading(false);
        })
        .catch(err => {
          console.error('Error fetching recommendations:', err);
          setRecommendedProducts([]);
          setRecommendedLoading(false);
        });
    }
  }, [category, searchQuery, currentPage, sessionId, API_URL]);

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Show personalized recommendations section when on homepage */}
      {!category && !searchQuery && currentPage === 1 && recommendedProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">For You</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 via-transparent to-purple-200 mx-4"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendedProducts.slice(0, 5).map((product) => (
              <div 
                key={product._id}
                className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative w-full h-40 overflow-hidden">
                  <img
                    loading="lazy"
                    src={product.image || 'https://placehold.co/300x200/EEEEEE/000000?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs line-clamp-2">{product.description}</p>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-bold text-purple-700">
                      {currencySymbol}{convertPrice(product.price, currencyCode)}
                    </p>
                    
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product._id);
                      }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show loading state for recommendations */}
      {!category && !searchQuery && currentPage === 1 && recommendedLoading && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">For You</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 via-transparent to-purple-200 mx-4"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
                <div className="w-full h-40 bg-gradient-to-r from-gray-200 to-gray-100 rounded-t-xl"></div>
                <div className="p-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded mb-2 w-3/4"></div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-1/3"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-100"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modern Filter and Search Bar */}
      <div className="mb-8 bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchProducts')}
                className="w-full pl-12 pr-4 py-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <select
              className="w-full md:w-48 px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300 shadow-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value=''>{t('allCategories')}</option>
              <option value='men'>{t('men')}</option>
              <option value='women'>{t('women')}</option>
              <option value='kids'>{t('kids')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Count Display */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-700">
          Showing <span className="font-bold text-purple-700">{products.length}</span> products
        </p>
        <p className="text-gray-500 text-sm">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p, index) => (
          <div
            key={p._displayId}
            className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Product Image */}
            <div 
              className="relative w-full h-48 overflow-hidden cursor-pointer"
              onClick={() => setSelectedProduct(p)}
            >
              <img
                loading="lazy"
                src={p.image || 'https://placehold.co/300x200/EEEEEE/000000?text=No+Image'}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm line-clamp-2">{p.description}</p>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 
                className="text-lg font-bold text-gray-900 mb-1 truncate cursor-pointer hover:text-purple-700 transition-colors duration-200"
                onClick={() => setSelectedProduct(p)}
              >
                {p.name}
              </h3>
              
              <div className="flex justify-between items-center mt-3">
                <p className="text-xl font-bold text-purple-700">
                  {currencySymbol}{convertPrice(p.price, currencyCode)}
                </p>
                
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform group-hover:scale-110 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(p._id);
                  }}
                  aria-label={`Add ${p.name} to cart`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              
              {/* Product Details */}
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                {p.category && (
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{p.category}</span>
                )}
                {p.size && (
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{p.size}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1} 
              className={`px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('previous')}
            </button>
            
            <span className="mx-4 text-gray-700 font-medium">
              {t('page')} {currentPage} <span className="text-gray-500">of</span> {totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              className={`px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200'
              }`}
            >
              {t('next')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentPage === i + 1
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;