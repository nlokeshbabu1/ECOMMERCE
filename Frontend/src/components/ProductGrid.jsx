import React from 'react';

// A more visually appealing skeleton loader that matches the new card design
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
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
}) => {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  return (
    <>
      {/* Redesigned Filter and Search Bar */}
      <div className='flex flex-col md:flex-row gap-4 items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200'>
        <select
          className='w-full md:w-auto bg-gray-100 text-gray-800 border-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
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
          className='w-full bg-gray-100 text-gray-800 placeholder-gray-500 border-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Redesigned Product Cards Grid with Hover Animation */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map((p) => (
          // --- ANIMATION START ---
          // This is the new outer container. It creates the gradient border on hover.
          <div
            key={p._displayId}
            className="group relative rounded-xl p-0.5 bg-white hover:bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            {/* This inner div contains all the content and always has a white background. */}
            <div className="bg-white rounded-[10px] w-full h-full p-4 flex flex-col">
              <div 
                  className="relative w-full h-48 mb-4 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(p)}
              >
                  <img
                      loading="lazy"
                      src={p.image || 'https://placehold.co/300x200/EEEEEE/000000?text=No+Image'}
                      alt={p.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
              </div>
              <h3 
                  className='text-lg font-bold text-gray-800 mb-1 truncate cursor-pointer'
                  onClick={() => setSelectedProduct(p)}
              >
                  {p.name}
              </h3>
              <p className='text-sm text-gray-500 mb-4 flex-grow min-h-[40px]'>{p.description}</p>
              <div className="flex justify-between items-center mt-auto">
                  <p className='text-xl font-black text-purple-700'>{currencySymbol}{convertPrice(p.price, currencyCode)}</p>
                  <button
                      className='bg-purple-100 text-purple-700 p-2 rounded-full hover:bg-purple-600 hover:text-white transition-all z-10'
                      onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p._id);
                      }}
                      aria-label={`Add ${p.name} to cart`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </button>
              </div>
            </div>
          </div>
          // --- ANIMATION END ---
        ))}
      </div>

      {/* Redesigned Pagination Controls */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center mt-12 space-x-4'>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className='px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition'>
                {t('previous')}
            </button>
            <span className='text-lg font-semibold text-gray-700'>{t('page')} {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className='px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition'>
                {t('next')}
            </button>
        </div>
      )}
    </>
  );
};

export default ProductGrid;