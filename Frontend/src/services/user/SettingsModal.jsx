import React from 'react';
import axios from 'axios';

const SettingsModal = ({ t, showSettingsModal, setShowSettingsModal, userEmail, userRole, handleLogout, sessionId, showPopup }) => {
  if (!showSettingsModal) return null;

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
      return;
    }

    try {
      const API_URL = window.API_BASE_URL || '';
      const response = await axios.delete(`${API_URL}/api/user`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          session_id: sessionId
        }
      });

      if (response.status === 200) {
        showPopup('Account deleted successfully!', 'success');
        handleLogout(); // Log out the user after account deletion
        setShowSettingsModal(false); // Close the settings modal
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete account. Please try again.';
      showPopup(errorMessage, 'error');
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className='fixed inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
    >
      <div className='relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 animate-in fade-in-90 zoom-in-95'>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <h2 className='text-2xl font-bold text-center'>Account Settings</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="mr-4">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div>
              <p className='text-gray-900 font-semibold'>{userEmail}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userRole === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : userRole === 'seller' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
              }`}>
                {userRole}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              className='w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md flex items-center justify-center'
              onClick={handleDeleteAccount}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </button>
            
            <button 
              className='w-full py-3 px-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md'
              onClick={() => {
                setShowSettingsModal(false);
                handleLogout();
              }}
            >
              Sign Out
            </button>
            
            <button 
              className='w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300'
              onClick={() => setShowSettingsModal(false)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;