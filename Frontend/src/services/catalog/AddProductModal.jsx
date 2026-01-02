import React from 'react';

const AddProductModal = ({ t, setAddMode, newProduct, setNewProduct, submitAddProduct }) => {

  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    // Ensure numeric fields are stored as numbers, not strings
    const isNumeric = name === 'price' || name === 'stockAvailable';
    setNewProduct((prev) => ({
      ...prev,
      [name]: isNumeric ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

    // This function now handles the form submission event
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents page reload
        submitAddProduct(); // Calls the function passed from App.jsx
      };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className='fixed inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
    >
      <form
        className='bg-white rounded-2xl shadow-2xl max-w-lg w-full text-gray-900 transform transition-all duration-300 scale-95 animate-in fade-in-90 zoom-in-95 overflow-hidden'
        onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            submitAddProduct(); // Call the handler from App.jsx
        }}
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <h2 className='text-xl font-bold text-center flex items-center justify-center'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('addProduct')}
          </h2>
        </div>
        
        <div className="p-6">
          {/* --- Full list of form fields --- */}
          <div className="space-y-4">
            <div className="relative">
              <input 
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300'
                type='text' 
                name='name' 
                placeholder={t('productName')} 
                value={newProduct.name} 
                onChange={handleAddProductChange} 
                required 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <input 
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300'
                type='number' 
                name='price' 
                placeholder={t('price')} 
                value={newProduct.price} 
                onChange={handleAddProductChange} 
                min='0' 
                step='0.01' 
                required 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select 
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent appearance-none transition-all duration-300'
                name='category' 
                value={newProduct.category} 
                onChange={handleAddProductChange} 
                required
              >
                <option value=''>{t('selectCategory')}</option>
                <option value='men'>{t('men')}</option>
                <option value='women'>{t('women')}</option>
                <option value='kids'>{t('kids')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <input 
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300'
                type='text' 
                name='image' 
                placeholder={t('imageUrl')} 
                value={newProduct.image} 
                onChange={handleAddProductChange} 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <input 
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300'
                type='number' 
                name='stockAvailable' 
                placeholder={t('stockAvailable')} 
                value={newProduct.stockAvailable} 
                onChange={handleAddProductChange} 
                min='0' 
                step='1' 
                required 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <input 
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300'
                type='text' 
                name='size' 
                placeholder={t('size')} 
                value={newProduct.size} 
                onChange={handleAddProductChange} 
                required 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <textarea 
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300'
                name='description' 
                placeholder={t('description')} 
                value={newProduct.description} 
                onChange={handleAddProductChange} 
                rows='3' 
              />
              <div className="absolute top-3 left-0 flex items-start pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className='flex flex-col sm:flex-row gap-3 mt-8'>
            <button 
              type='button' 
              className='flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md'
              onClick={() => setAddMode(false)}
            >
              {t('cancel')}
            </button>
            <button 
              type='submit' 
              className='flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md'
            >
              {t('addProductButton')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal;