import React from 'react';

const ProductGrid = ({ t, products, setSelectedProduct, category, setCategory, searchQuery, setSearchQuery, currentPage, totalPages, handlePageChange, convertPrice, currencySymbol, currencyCode, addToCart }) => {
  
  const handleBuyNow = (product) => {
    // This action should be handled by a function passed from App.jsx
    // as it involves more than just the grid's scope (e.g., calling an API)
    console.log("Buy Now clicked for:", product.name);
  };
  
  return (
    <>
      {/* Category Filter and Search Bar */}
      <div className='flex flex-col md:flex-row gap-4 items-center mb-4 bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-300 animate-slide-in-up'>
        <select
          className='bg-white text-gray-900 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value=''>{t('allCategories')}</option>
          <option value='men'>{t('men')}</option>
          <option value='women'>{t('women')}</option>
          <option value='kids'>{t('kids')}</option>
        </select>
        <input
          type='text'
          placeholder={t('searchProducts')}
          className='bg-white text-gray-900 placeholder-gray-500 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {products.map((p) => (
          <div key={p._id || p._displayId} className='border border-gray-300 p-4 rounded-lg bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200 product-item'>
            <img
              loading="lazy" // <-- PERFORMANCE: Lazy load images
              src={p.image || 'https://placehold.co/300x200/EEEEEE/000000?text=No+Image'}
              alt={p.name}
              className='w-full h-40 object-cover rounded mb-2 cursor-pointer'
              onClick={() => setSelectedProduct(p)}
            />
            <h3 className='text-lg font-bold text-gray-900 cursor-pointer' onClick={() => setSelectedProduct(p)}>
              {p.name}
            </h3>
            <p className='text-sm text-gray-700 truncate'>{p.description}</p>
            <p className='text-green-600 font-bold mt-2'>{currencySymbol}{convertPrice(p.price, currencyCode)}</p>
            {p.stockAvailable !== undefined && (
              <p className='text-sm text-gray-600 mt-1'>Stock: {p.stockAvailable}</p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                className='bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition'
                onClick={() => addToCart(p._id)}
                aria-label={`Add ${p.name} to cart`}
              >
                {t('addToCart')}
              </button>
              <button
                className='bg-gray-400 text-gray-900 px-3 py-1 rounded hover:bg-gray-500 transition'
                onClick={() => handleBuyNow(p)}
                aria-label={`Buy ${p.name} now`}
              >
                {t('buyNow')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center mt-8 space-x-4'>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className='bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition'>
            {t('previous')}
          </button>
          <span className='text-lg font-semibold text-gray-900'>
            {t('page')} {currentPage} of {totalPages}
          </span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className='bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition'>
            {t('next')}
          </button>
        </div>
      )}
    </>
  );
};

export default ProductGrid;