import React from 'react';

const SettingsModal = ({ t, showSettingsModal, setShowSettingsModal, userEmail, userRole }) => {
  if (!showSettingsModal) return null;

  return (
    <div role="dialog" aria-modal="true" className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50'>
      <div className='relative z-10 w-full max-w-sm p-8 bg-white/90 backdrop-blur-md border border-gray-300 rounded-3xl shadow-2xl'>
        <button aria-label="Close" className='absolute top-4 right-4 text-gray-700 text-xl' onClick={() => setShowSettingsModal(false)}>&times;</button>
        <h2 className='text-3xl font-bold mb-6 text-center text-purple-700'>Account Settings</h2>
        <div className='text-gray-800 text-lg space-y-4'>
          <p><strong>Email:</strong> {userEmail}</p>
          <p><strong>Role:</strong> {userRole}</p>
        </div>
        <button className='w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg mt-6' onClick={() => setShowSettingsModal(false)}>
          {t('close')}
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;