import React, { useState, useEffect } from 'react';

// This panel is only used by the AuthModal, so it's good practice to keep it here.
const WelcomePanel = ({ t }) => {
  const image = 'https://placehold.co/400x600/3498db/ffffff?text=Fashion';
  return (
    <div className='hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-l-3xl relative overflow-hidden flex-1'>
      <img src={image} alt="Fashion Background" className="absolute top-0 left-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-8 text-center z-10">
        <h2 className='text-4xl font-bold text-white mb-4 drop-shadow-lg'>{t('welcomeToShopping')}</h2>
        <p className='text-white drop-shadow-lg'>{t('discoverLatestFashion')}</p>
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
    <div role="dialog" aria-modal="true" className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4'>
      <div className='relative z-10 w-full max-w-4xl flex bg-white/90 backdrop-blur-md border border-gray-300 rounded-3xl shadow-2xl overflow-hidden'>
        <WelcomePanel t={t} />
        <div className='flex-1 p-8 md:p-10 relative'>
          <button aria-label="Close" className='absolute top-4 right-4 text-gray-700 text-xl' onClick={() => setShowLoginModal(false)}>&times;</button>
          
          {showSellerRegisterModal ? (
            // --- Seller Registration Form ---
            <>
              <h2 className='text-3xl font-bold mb-6 text-center text-purple-700'>{t('sellerRegistration')}</h2>
              {/* Form fields for seller */}
              <input className='w-full p-3 mb-4 bg-gray-100 border rounded-xl' type='text' placeholder={t('displayName')} value={sellerName} onChange={(e) => setSellerName(e.target.value)} required />
              <input className='w-full p-3 mb-4 bg-gray-100 border rounded-xl' type='text' placeholder={t('phone')} value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} required />
              <input className='w-full p-3 mb-4 bg-gray-100 border rounded-xl' type='text' placeholder={t('gstNumber')} value={sellerGSTNumber} onChange={(e) => setSellerGSTNumber(e.target.value)} required />
              <textarea className='w-full p-3 mb-4 bg-gray-100 border rounded-xl resize-y' placeholder={t('address')} value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} required></textarea>
              <input className={`w-full p-3 mb-1 bg-gray-100 border rounded-xl ${emailError ? 'border-red-500' : 'border-gray-300'}`} type='email' placeholder={t('email')} value={email} onChange={handleEmailChange} required />
              {emailError && <p className='text-red-500 text-sm mb-4'>{emailError}</p>}
              <div className='relative mb-1'>
                  <input className='w-full p-3 bg-gray-100 border rounded-xl pr-10' type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center' onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
              
              {/* --- ADDED: CAPTCHA Section for Seller Registration --- */}
              <div className='flex items-center justify-between my-4'>
                <span className='text-xl font-bold text-gray-800 bg-gray-200 px-4 py-2 rounded-lg select-none tracking-wider'>{captchaValue}</span>
                <button type='button' onClick={generateCaptcha} className='text-sm text-blue-600 hover:underline'>Refresh</button>
              </div>
              <input
                className={`w-full p-3 bg-gray-100 border rounded-xl mb-3 ${captchaError ? 'border-red-500' : 'border-gray-300'}`}
                type='text' placeholder='Enter CAPTCHA' value={userCaptchaInput} onChange={(e) => setUserCaptchaInput(e.target.value)} required />
              {captchaError && <p className='text-red-500 text-sm mb-4'>Incorrect CAPTCHA.</p>}
              
              <button className='w-full py-3 bg-green-600 text-white font-semibold rounded-xl' onClick={() => handleSubmit(handleSellerRegister)} disabled={isAuthenticating}>
                {isAuthenticating ? <div className="spinner mx-auto"></div> : t('registerAsSeller')}
              </button>
              <button className='w-full py-3 mt-3 bg-gray-400 text-gray-900 font-semibold rounded-xl' onClick={() => setShowSellerRegisterModal(false)} disabled={isAuthenticating}>{t('backToLogin')}</button>
            </>
          ) : (
            // --- Regular Login/Register Form ---
            <>
              <h2 className='text-3xl font-bold mb-6 text-center text-purple-700'>{t(isRegistering ? 'register' : 'login')}</h2>
              <input className={`w-full p-3 mb-1 bg-gray-100 border rounded-xl ${emailError ? 'border-red-500' : 'border-gray-300'}`} type='email' placeholder={t('email')} value={email} onChange={handleEmailChange} />
              {emailError && <p className='text-red-500 text-sm mb-4'>{emailError}</p>}
              <div className='relative mb-1'>
                  <input className='w-full p-3 bg-gray-100 border rounded-xl pr-10' type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center' onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
              
              {isRegistering && password.length > 0 && (
                <div className={`text-sm mt-1 mb-4 ${passwordStrength.color}`}>
                  Password Strength: <span className="font-semibold">{passwordStrength.text}</span>
                  <ul className="list-disc list-inside text-xs mt-1">
                    {passwordStrength.messages.map((msg, index) => <li key={index}>{msg}</li>)}
                  </ul>
                </div>
              )}
              
              {/* --- ADDED: CAPTCHA Section for Login/Register --- */}
              <div className='flex items-center justify-between my-4'>
                <span className='text-xl font-bold text-gray-800 bg-gray-200 px-4 py-2 rounded-lg select-none tracking-wider'>{captchaValue}</span>
                <button type='button' onClick={generateCaptcha} className='text-sm text-blue-600 hover:underline'>Refresh</button>
              </div>
              <input
                className={`w-full p-3 bg-gray-100 border rounded-xl mb-3 ${captchaError ? 'border-red-500' : 'border-gray-300'}`}
                type='text' placeholder='Enter CAPTCHA' value={userCaptchaInput} onChange={(e) => setUserCaptchaInput(e.target.value)} required />
              {captchaError && <p className='text-red-500 text-sm mb-4'>Incorrect CAPTCHA.</p>}
              
              <button className='w-full py-3 bg-purple-600 text-white font-semibold rounded-xl' onClick={() => handleSubmit(isRegistering ? handleRegister : handleLogin)} disabled={isAuthenticating}>
                {isAuthenticating ? <div className="spinner mx-auto"></div> : t(isRegistering ? 'register' : 'login')}
              </button>
              
              <p className='text-center text-sm mt-4'>
                {isRegistering ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                <button className='text-purple-700 font-medium' onClick={() => setIsRegistering(!isRegistering)}>{t(isRegistering ? 'loginHere' : 'registerHere')}</button>
              </p>
              <p className='text-center text-sm mt-2'>
                <button className='text-blue-600 font-medium' onClick={() => showPopup('Forgot Password functionality to be implemented.', 'info')}>{t('forgotPassword')}</button>
              </p>
              <button className='w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-xl' onClick={() => setShowSellerRegisterModal(true)} disabled={isAuthenticating}>
                {t('registerAsSeller')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;