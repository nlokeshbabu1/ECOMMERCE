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
    <div role="dialog" aria-modal="true" className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4'>
      <form
        className='bg-white p-8 rounded-2xl border border-gray-300 shadow-2xl max-w-md w-full text-gray-900'
        onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            submitAddProduct(); // Call the handler from App.jsx
        }}
      >
        <h2 className='text-2xl font-bold mb-6 text-center'>{t('addProduct')}</h2>
        
        {/* --- Full list of form fields --- */}
        <div className="space-y-4">
            <input 
                className='bg-gray-100 p-3 w-full rounded-lg border focus:ring-2 focus:ring-blue-400' 
                type='text' 
                name='name' 
                placeholder={t('productName')} 
                value={newProduct.name} 
                onChange={handleAddProductChange} 
                required 
            />
            <input 
                className='bg-gray-100 p-3 w-full rounded-lg border focus:ring-2 focus:ring-blue-400' 
                type='number' 
                name='price' 
                placeholder={t('price')} 
                value={newProduct.price} 
                onChange={handleAddProductChange} 
                min='0' 
                step='0.01' 
                required 
            />
            <select 
                className='bg-gray-100 p-3 w-full rounded-lg border focus:ring-2 focus:ring-blue-400' 
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
            <input 
                className='bg-gray-100 p-3 w-full rounded-lg border focus:ring-2 focus:ring-blue-400' 
                type='text' 
                name='image' 
                placeholder={t('imageUrl')} 
                value={newProduct.image} 
                onChange={handleAddProductChange} 
            />
            <input 
                className='bg-gray-100 p-3 w-full rounded-lg border focus:ring-2 focus:ring-blue-400' 
                type='number' 
                name='stockAvailable' 
                placeholder={t('stockAvailable')} 
                value={newProduct.stockAvailable} 
                onChange={handleAddProductChange} 
                min='0' 
                step='1' 
                required 
            />
            <input 
                className='bg-gray-100 p-3 w-full rounded-lg border focus:ring-2 focus:ring-blue-400' 
                type='text' 
                name='size' 
                placeholder={t('size')} 
                value={newProduct.size} 
                onChange={handleAddProductChange} 
                required 
            />
            <textarea 
                className='bg-gray-100 p-3 w-full rounded-lg border resize-y focus:ring-2 focus:ring-blue-400' 
                name='description' 
                placeholder={t('description')} 
                value={newProduct.description} 
                onChange={handleAddProductChange} 
                rows='3' 
            />
        </div>
        
        <div className='flex justify-between mt-6'>
          <button type='button' className='bg-gray-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500 transition' onClick={() => setAddMode(false)}>{t('cancel')}</button>
          <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition'>{t('addProductButton')}</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal;