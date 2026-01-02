import React, { useState, useEffect } from 'react';
import ForgotPasswordModal from './ForgotPasswordModal';

// This panel is only used by the AuthModal, so it's good practice to keep it here.
const WelcomePanel = ({ t }) => {
  const image = 'https://placehold.co/400x600/3498db/ffffff?text=Fashion';
  return (
    <div className='hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-l-2xl relative overflow-hidden flex-1'>
      <img src={image} alt="Fashion Background" className="absolute top-0 left-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700/80 to-blue-600/80 flex flex-col items-center justify-center p-8 text-center z-10">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className='text-3xl font-bold text-white mb-3 drop-shadow-lg'>{t('welcome')}</h2>
        <p className='text-purple-100 text-lg drop-shadow-lg'>Discover the latest fashion trends</p>
        <div className="mt-6 flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AuthModal = ({
  t,
  setShowLoginModal,
  handleLogin,
  handleRegister,
  handleSellerRegister,
  email,
  setEmail,
  password,
  setPassword,
  isRegistering,
  setIsRegistering,
  showSellerRegisterModal,
  setShowSellerRegisterModal,
  sellerName,
  setSellerName,
  sellerPhone,
  setSellerPhone,
  sellerGSTNumber,
  setSellerGSTNumber,
  sellerAddress,
  setSellerAddress,
  showPopup
}) => {
  const [focusField, setFocusField] = useState(null);
  const [captchaValue, setCaptchaValue] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ text: '', color: 'text-gray-500', messages: [] });
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    setUserCaptchaInput('');
    setCaptchaError(false);
  };

    const getPasswordStrength = (password) => {
    let strength = 0;
    const messages = [];
    if (password.length >= 8) { strength++; messages.push('At least 8 characters'); } else { messages.push('Needs at least 8 characters'); }
    if (/[a-z]/.test(password)) { strength++; messages.push('Lowercase letter'); } else { messages.push('Needs lowercase letter'); }
    if (/[A-Z]/.test(password)) { strength++; messages.push('Uppercase letter'); } else { messages.push('Needs uppercase letter'); }
    if (/[0-9]/.test(password)) { strength++; messages.push('Number'); } else { messages.push('Needs a number'); }
    if (/[^a-zA-Z0-9]/.test(password)) { strength++; messages.push('Special character'); } else { messages.push('Needs a special character'); }
    
    if (password.length === 0) return { text: '', color: 'text-gray-500', messages: [] };
    if (strength === 5) return { text: 'Very Strong', color: 'text-green-600', messages };
    if (strength >= 4) return { text: 'Strong', color: 'text-blue-600', messages };
    if (strength >= 3) return { text: 'Medium', color: 'text-yellow-600', messages };
    return { text: 'Weak', color: 'text-red-600', messages };
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (isRegistering || showSellerRegisterModal) {
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordStrength({ text: '', color: 'text-gray-500', messages: [] });
    }
  }, [password, isRegistering, showSellerRegisterModal]);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(newEmail && !validateEmail(newEmail) ? t('invalidEmail') : '');
  };

  const handleSubmit = async (actionHandler) => {
    if (emailError) {
      showPopup(t('invalidEmail'), 'error');
      return;
    }
    // Use toUpperCase() for case-insensitive comparison
    if (userCaptchaInput.toUpperCase() !== captchaValue.toUpperCase()) {
      setCaptchaError(true);
      setShowPassword(false); // Reset password visibility on error
      showPopup('Incorrect CAPTCHA. Please try again.', 'error');
      generateCaptcha();
      return;
    }

    setIsAuthenticating(true);
    try {
      await actionHandler();
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className='fixed inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4'
    >
      <div className='relative z-10 w-full max-w-4xl flex bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-out transform scale-95 animate-in fade-in-90 zoom-in-90'>
        <WelcomePanel t={t} />
        <div className='flex-1 p-8 md:p-10 relative'>
          <button 
            aria-label="Close" 
            className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-300'
            onClick={() => {
              setShowLoginModal(false);
              setShowPassword(false); // Reset password visibility
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {showSellerRegisterModal ? (
            // --- Seller Registration Form ---
            <>
              <div className="text-center mb-8">
                <h2 className='text-2xl font-bold text-gray-800'>{t('sellerRegistration')}</h2>
                <p className="text-gray-600 mt-2">Create your seller account to start selling</p>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(handleSellerRegister); }}>
                {/* Form fields for seller */}
                <div className="relative">
                  <input 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'name' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300`}
                    type='text' 
                    placeholder={t('displayName')} 
                    value={sellerName} 
                    onChange={(e) => setSellerName(e.target.value)}
                    onFocus={() => setFocusField('name')}
                    onBlur={() => setFocusField(null)}
                    required 
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'phone' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300`}
                    type='text' 
                    placeholder={t('phone')} 
                    value={sellerPhone} 
                    onChange={(e) => setSellerPhone(e.target.value)}
                    onFocus={() => setFocusField('phone')}
                    onBlur={() => setFocusField(null)}
                    required 
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'gst' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300`}
                    type='text' 
                    placeholder={t('gstNumber')} 
                    value={sellerGSTNumber} 
                    onChange={(e) => setSellerGSTNumber(e.target.value)}
                    onFocus={() => setFocusField('gst')}
                    onBlur={() => setFocusField(null)}
                    required 
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <textarea 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'address' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300 resize-y`}
                    placeholder={t('address')} 
                    value={sellerAddress} 
                    onChange={(e) => setSellerAddress(e.target.value)}
                    onFocus={() => setFocusField('address')}
                    onBlur={() => setFocusField(null)}
                    rows={3}
                    required
                  ></textarea>
                  <div className="absolute inset-y-0 left-0 flex items-start pt-3 pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'email' || emailError ? 'border-red-500 ring-2 ring-red-200' : focusField === 'email' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300`}
                    type='email' 
                    placeholder={t('email')} 
                    value={email} 
                    onChange={handleEmailChange}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    required 
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {emailError && <p className='text-red-500 text-sm mt-1'>{emailError}</p>}
                
                <div className="relative">
                  <input 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'password' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300 pr-12`}
                    type={showPassword ? 'text' : 'password'} 
                    placeholder={t('password')} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField(null)}
                    required 
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button 
                    type='button' 
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* --- CAPTCHA Section for Seller Registration --- */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">CAPTCHA Verification</label>
                    <button 
                      type='button' 
                      onClick={generateCaptcha} 
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className='text-xl font-bold text-gray-800 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-3 rounded-lg select-none tracking-wider shadow-sm w-full text-center'>
                      {captchaValue}
                    </span>
                  </div>
                  <input
                    className={`w-full mt-3 px-4 py-3 bg-gray-50 border ${captchaError ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300`}
                    type='text' 
                    placeholder='Enter CAPTCHA' 
                    value={userCaptchaInput} 
                    onChange={(e) => setUserCaptchaInput(e.target.value)}
                    required 
                  />
                  {captchaError && <p className='text-red-500 text-sm mt-1'>Incorrect CAPTCHA. Please try again.</p>}
                </div>
                
                <button 
                  className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md mt-6'
                  type="submit"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    t('registerAsSeller')
                  )}
                </button>
                
                <button 
                  className='w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 mt-2'
                  type="button"
                  onClick={() => {
                    setShowSellerRegisterModal(false);
                    setShowPassword(false); // Reset password visibility
                  }}
                  disabled={isAuthenticating}
                >
                  {t('backToLogin')}
                </button>
              </form>
            </>
          ) : (
            // --- Regular Login/Register Form ---
            <>
              <div className="text-center mb-8">
                <h2 className='text-2xl font-bold text-gray-800'>{t(isRegistering ? 'register' : 'login')}</h2>
                <p className="text-gray-600 mt-2">
                  {isRegistering 
                    ? 'Create your account to get started' 
                    : 'Sign in to your account to continue'}
                </p>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(isRegistering ? handleRegister : handleLogin); }}>
                <div className="relative">
                  <input 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'email' || emailError ? 'border-red-500 ring-2 ring-red-200' : focusField === 'email' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300`}
                    type='email' 
                    placeholder={t('email')} 
                    value={email} 
                    onChange={handleEmailChange}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {emailError && <p className='text-red-500 text-sm mt-1'>{emailError}</p>}
                
                <div className="relative">
                  <input 
                    className={`w-full px-4 py-3 bg-gray-50 border ${focusField === 'password' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300 pr-12`}
                    type={showPassword ? 'text' : 'password'} 
                    placeholder={t('password')} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField(null)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button 
                    type='button' 
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {isRegistering && password.length > 0 && (
                  <div className={`text-sm mt-1 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 ${passwordStrength.color}`}>
                    <div className="flex justify-between items-center">
                      <span>Password Strength: <span className="font-semibold">{passwordStrength.text}</span></span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            passwordStrength.text === 'Weak' ? 'bg-red-500 w-1/4' : 
                            passwordStrength.text === 'Medium' ? 'bg-yellow-500 w-1/2' : 
                            passwordStrength.text === 'Strong' ? 'bg-blue-500 w-3/4' : 
                            passwordStrength.text === 'Very Strong' ? 'bg-green-500 w-full' : 'w-0'
                          } transition-all duration-300`}
                        ></div>
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-xs mt-2">
                      {passwordStrength.messages.map((msg, index) => (
                        <li key={index} className={
                          msg.includes('Needs') ? 'text-red-500' : 'text-green-500'
                        }>
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* --- CAPTCHA Section for Login/Register --- */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">CAPTCHA Verification</label>
                    <button 
                      type='button' 
                      onClick={generateCaptcha} 
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className='text-xl font-bold text-gray-800 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-3 rounded-lg select-none tracking-wider shadow-sm w-full text-center'>
                      {captchaValue}
                    </span>
                  </div>
                  <input
                    className={`w-full mt-3 px-4 py-3 bg-gray-50 border ${captchaError ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} rounded-lg focus:outline-none transition-all duration-300`}
                    type='text' 
                    placeholder='Enter CAPTCHA' 
                    value={userCaptchaInput} 
                    onChange={(e) => setUserCaptchaInput(e.target.value)}
                    required 
                  />
                  {captchaError && <p className='text-red-500 text-sm mt-1'>Incorrect CAPTCHA. Please try again.</p>}
                </div>
                
                <button 
                  className='w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md'
                  type="submit"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isRegistering ? 'Registering...' : 'Logging in...'}
                    </div>
                  ) : (
                    t(isRegistering ? 'register' : 'login')
                  )}
                </button>
                
                <div className="flex justify-between items-center mt-3">
                  <p className='text-sm'>
                    {isRegistering ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                    <button 
                      className='text-purple-600 font-semibold hover:text-purple-800 transition-colors duration-300'
                      onClick={() => setIsRegistering(!isRegistering)}
                      data-testid='register-here-button'
                    >
                      {t(isRegistering ? 'loginHere' : 'registerHere')}
                    </button>
                  </p>
                </div>
                
                <p className='text-center text-sm mt-4'>
                  <button 
                    className='text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300'
                    onClick={() => setShowForgotPassword(true)}
                  >
                    {t('forgotPassword')}
                  </button>
                </p>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
                
                <button 
                  className='w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-300 shadow-md'
                  type="button"
                  onClick={() => setShowSellerRegisterModal(true)} 
                  disabled={isAuthenticating}
                >
                  {t('registerAsSeller')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      {showForgotPassword && (
        <ForgotPasswordModal 
          t={t}
          onClose={() => setShowForgotPassword(false)}
          onSwitchToLogin={() => {
            setShowForgotPassword(false);
            setIsRegistering(false);
          }}
          API_URL={window.API_BASE_URL || ''}
        />
      )}
    </div>
  );
};

export default AuthModal;