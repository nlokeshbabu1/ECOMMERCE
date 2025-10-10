import React from 'react';

const ProductDetailsModal = ({ t, selectedProduct, setSelectedProduct, addToCart, handleBuyNow, convertPrice, currencySymbol, currencyCode }) => {
  if (!selectedProduct) return null;

  return (
    <div role="dialog" aria-modal="true" className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg border border-gray-300 max-w-md w-full text-gray-900 animate-slide-in-up'>
        <img
          src={selectedProduct.image || 'https://placehold.co/300x200/EEEEEE/000000?text=No+Image'}
          alt={selectedProduct.name}
          className='w-full h-60 object-cover rounded mb-4'
        />
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>{selectedProduct.name}</h2>
        <p className='text-gray-700 mb-2'>{selectedProduct.description}</p>
        <p className='text-green-600 text-lg font-bold mb-4'>{currencySymbol}{convertPrice(selectedProduct.price, currencyCode)}</p>
        
        <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1 mb-4'>
          {selectedProduct.stockAvailable !== undefined && <span>Stock: {selectedProduct.stockAvailable}</span>}
          {selectedProduct.size && <span className='mx-1'>|</span>}
          {selectedProduct.size && <span>Size: {selectedProduct.size}</span>}
        </div>

        <div className="flex gap-2">
            <button
                className='flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
                onClick={() => {
                    addToCart(selectedProduct._id);
                    setSelectedProduct(null);
                }}
            >
                {t('addToCart')}
            </button>
            <button
                className='flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition'
                onClick={() => handleBuyNow(selectedProduct)}
            >
                {t('buyNow')}
            </button>
            <button
                className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'
                onClick={() => setSelectedProduct(null)}
            >
                {t('close')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;