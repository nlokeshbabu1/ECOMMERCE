import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Single Backend API Endpoint ---
// All frontend API calls will now go to this single endpoint.
const API_URL = 'http://localhost:5000';

// --- Currency Conversion Rates (Simulated) ---
const exchangeRates = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.93,
  JPY: 156.5,
  KRW: 1380.0,
  CNY: 7.25,
};

// Helper function to convert price based on target currency
const convertPrice = (price, targetCurrencyCode) => {
  const basePriceUSD = parseFloat(price);
  if (isNaN(basePriceUSD)) return price;

  const rate = exchangeRates[targetCurrencyCode];
  if (rate) {
    return (basePriceUSD * rate).toFixed(2);
  }
  return basePriceUSD.toFixed(2);
};

// Translations object for multiple languages
const translations = {
  en: {
    flag: '🇬🇧',
    name: 'English',
    storeName: 'Modern Clothing Store',
    currencySymbol: '$',
    currencyCode: 'USD',
    loginRegister: 'Login / Register',
    signOut: 'Sign Out',
    addProduct: '+ Add Product',
    yourCart: 'Your Cart',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',
    noItemsInCart: 'No items in the cart.',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    loadingProducts: 'Loading products...',
    allCategories: 'All Categories',
    men: 'Men',
    women: 'Women',
    kids: 'Kids',
    searchProducts: 'Search products...',
    close: 'Close',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login here',
    dontHaveAccount: 'Don\'t have an account?',
    registerHere: 'Register here',
    registerAsSeller: 'Register as Seller',
    sellerRegistration: 'Seller Registration',
    displayName: 'Name',
    phone: 'Phone',
    gstNumber: 'GST Number',
    address: 'Address',
    backToLogin: 'Back to Login',
    productName: 'Product Name',
    price: 'Price',
    selectCategory: 'Select Category',
    imageUrl: 'Image URL',
    stockAvailable: 'Stock Available',
    size: 'Size (e.g., S, M, L)',
    description: 'Description',
    cancel: 'Cancel',
    addProductButton: 'Add Product',
    fillAllFields: 'Please fill in all required fields!',
    productAddedSuccess: 'Product added successfully!',
    failedToAddProduct: 'Failed to add product! Please check your backend service at',
    loginRequiredAddToCart: 'Please log in to add items to your cart.',
    itemAddedToCart: ' added to cart!',
    outOfStock: 'Out of stock for ',
    maxAvailableAdded: ' or maximum available added.',
    loginRequiredManageCart: 'Please log in to manage cart.',
    itemQuantityDecreased: 'Item quantity decreased.',
    itemRemovedFromCart: 'Item removed from cart.',
    failedToRemoveItem: 'Failed to remove item from cart. Please check your backend service.',
    loginRequiredPurchase: 'Please log in to purchase items.',
    outOfStockShort: 'Sorry, "',
    outOfStockLong: '" is out of stock!',
    purchaseSuccess: 'Successfully purchased 1x ',
    thankYouPurchase: 'Thank you for your purchase! Your order has been placed. (Frontend simulation)',
    cartIsEmpty: 'Your cart is empty!',
    loginFailed: 'Login failed:',
    registrationFailed: 'Registration failed! Please check your backend server at',
    sellerRegistrationFailed: 'Seller registration failed! Please check your backend server at',
    registeredSuccessLogin: 'Registered successfully. Please log in.',
    sellerRegisteredSuccessLogin: 'Seller registered successfully! Please login.',
    failedToLoadCart: 'Failed to load cart from backend. Please check your backend service.',
    errorLoadingCartDetails: 'Error loading cart details.',
    checkoutFailed: 'Checkout failed due to a server error.',
    failedToFetchProducts: 'Failed to fetch products! Is your backend server running at',
    checkBackendServerAt: 'Please check your backend server at',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    settings: 'Settings',
    orders: 'Orders'
  },
  hi: {
    flag: '🇮🇳',
    name: 'हिन्दी',
    storeName: 'आधुनिक कपड़ों की दुकान',
    currencySymbol: '₹',
    currencyCode: 'INR',
    loginRegister: 'लॉगिन / रजिस्टर करें',
    signOut: 'साइन आउट करें',
    addProduct: '+ उत्पाद जोड़ें',
    yourCart: 'आपका कार्ट',
    total: 'कुल',
    proceedToCheckout: 'चेकआउट के लिए आगे बढ़ें',
    noItemsInCart: 'कार्ट में कोई आइटम नहीं है।',
    addToCart: 'कार्ट में जोड़ें',
    buyNow: 'अभी खरीदें',
    loadingProducts: 'उत्पाद लोड हो रहे हैं...',
    allCategories: 'सभी श्रेणियां',
    men: 'पुरुष',
    women: 'महिलाएं',
    kids: 'बच्चे',
    searchProducts: 'उत्पादों की खोज करें...',
    close: 'बंद करें',
    login: 'लॉगिन करें',
    register: 'रजिस्टर करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    alreadyHaveAccount: 'पहले से ही एक खाता है?',
    loginHere: 'यहां लॉगिन करें',
    dontHaveAccount: 'खाता नहीं है?',
    registerHere: 'यहां रजिस्टर करें',
    registerAsSeller: 'विक्रेता के रूप में रजिस्टर करें',
    sellerRegistration: 'विक्रेता पंजीकरण',
    displayName: 'नाम',
    phone: 'फ़ोन',
    gstNumber: 'जीएसटी नंबर',
    address: 'पता',
    backToLogin: 'लॉगिन पर वापस',
    productName: 'उत्पाद का नाम',
    price: 'कीमत',
    selectCategory: 'श्रेणी चुनें',
    imageUrl: 'छवि यूआरएल',
    stockAvailable: 'उपलब्ध स्टॉक',
    size: 'आकार (उदा. S, M, L)',
    description: 'विवरण',
    cancel: 'रद्द करें',
    addProductButton: 'उत्पाद जोड़ें',
    fillAllFields: 'कृपया सभी आवश्यक फ़ील्ड भरें!',
    productAddedSuccess: 'उत्पाद सफलतापूर्वक जोड़ा गया!',
    failedToAddProduct: 'उत्पाद जोड़ने में विफल! कृपया अपने बैकएंड सेवा की जाँच करें',
    loginRequiredAddToCart: 'आइटम को अपने कार्ट में जोड़ने के लिए कृपया लॉगिन करें।',
    itemAddedToCart: ' कार्ट में जोड़ा गया!',
    outOfStock: 'स्टॉक में नहीं है ',
    maxAvailableAdded: ' या अधिकतम उपलब्ध जोड़ा गया।',
    loginRequiredManageCart: 'कार्ट प्रबंधित करने के लिए कृपया लॉगिन करें।',
    itemQuantityDecreased: 'आइटम की मात्रा घटाई गई।',
    itemRemovedFromCart: 'कार्ट से आइटम हटाया गया।',
    failedToRemoveItem: 'कार्ट से आइटम हटाने में विफल। कृपया अपने बैकएंड सेवा की जाँच करें।',
    loginRequiredPurchase: 'आइटम खरीदने के लिए कृपया लॉगिन करें।',
    outOfStockShort: 'क्षमा करें, "',
    outOfStockLong: '" स्टॉक में नहीं है!',
    purchaseSuccess: 'सफलतापूर्वक 1x खरीदा गया ',
    thankYouPurchase: 'आपकी खरीद के लिए धन्यवाद! आपका ऑर्डर दिया गया है। (फ्रंटएंड सिमुलेशन)',
    cartIsEmpty: 'आपका कार्ट खाली है!',
    loginFailed: 'लॉगिन विफल:',
    registrationFailed: 'पंजीकरण विफल! कृपया अपने बैकएंड सर्वर की जाँच करें',
    sellerRegistrationFailed: 'विक्रेता पंजीकरण विफल! कृपया अपने बैकएंड सर्वर की जाँच करें',
    registeredSuccessLogin: 'सफलतापूर्वक पंजीकृत। कृपया लॉगिन करें।',
    sellerRegisteredSuccessLogin: 'विक्रेता सफलतापूर्वक पंजीकृत! कृपया लॉगिन करें।',
    failedToLoadCart: 'बैकएंड से कार्ट लोड करने में विफल। कृपया अपने बैकएंड सेवा की जाँच करें।',
    errorLoadingCartDetails: 'कार्ट विवरण लोड करने में त्रुटि।',
    checkoutFailed: 'सर्वर त्रुटि के कारण चेकआउट विफल।',
    failedToFetchProducts: 'उत्पाद प्राप्त करने में विफल! क्या आपका बैकएंड सर्वर चल रहा है',
    checkBackendServerAt: 'कृपया अपने बैकएंड सर्वर की जाँच करें',
    previous: 'पिछला',
    next: 'अगला',
    page: 'पृष्ठ',
    settings: 'सेटिंग्स',
    orders: 'आदेश'
  },
  es: {
    flag: '🇪🇸',
    name: 'Español',
    storeName: 'Tienda de Ropa Moderna',
    currencySymbol: '€',
    currencyCode: 'EUR',
    loginRegister: 'Iniciar Sesión / Registrarse',
    signOut: 'Cerrar Sesión',
    addProduct: '+ Añadir Producto',
    yourCart: 'Tu Carrito',
    total: 'Total',
    proceedToCheckout: 'Proceder al Pago',
    noItemsInCart: 'No hay artículos en el carrito.',
    addToCart: 'Añadir al Carrito',
    buyNow: 'Comprar Ahora',
    loadingProducts: 'Cargando productos...',
    allCategories: 'Todas las Categorías',
    men: 'Hombres',
    women: 'Mujeres',
    kids: 'Niños',
    searchProducts: 'Buscar productos...',
    close: 'Cerrar',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    loginHere: 'Iniciar sesión aquí',
    dontHaveAccount: '¿No tienes una cuenta?',
    registerHere: 'Registrarse aquí',
    registerAsSeller: 'Registrarse como Vendedor',
    sellerRegistration: 'Registro de Vendedor',
    displayName: 'Nombre',
    phone: 'Teléfono',
    gstNumber: 'Número GST',
    address: 'Dirección',
    backToLogin: 'Volver a Iniciar Sesión',
    productName: 'Nombre del Producto',
    price: 'Precio',
    selectCategory: 'Seleccionar Categoría',
    imageUrl: 'URL de la Imagen',
    stockAvailable: 'Stock Disponible',
    size: 'Talla (ej. S, M, L)',
    description: 'Descripción',
    cancel: 'Cancelar',
    addProductButton: 'Añadir Producto',
    fillAllFields: '¡Por favor, rellena todos los campos requeridos!',
    productAddedSuccess: '¡Producto añadido exitosamente!',
    failedToAddProduct: '¡Error al añadir producto! Por favor, verifica tu servicio backend en',
    loginRequiredAddToCart: 'Por favor, inicia sesión para añadir artículos a tu carrito.',
    itemAddedToCart: ' añadido al carrito!',
    outOfStock: 'Sin stock para ',
    maxAvailableAdded: ' o el máximo disponible añadido.',
    loginRequiredManageCart: 'Por favor, inicia sesión para gestionar el carrito.',
    itemQuantityDecreased: 'Cantidad del artículo disminuida.',
    itemRemovedFromCart: 'Artículo eliminado del carrito.',
    failedToRemoveItem: 'Error al eliminar el artículo del carrito. Por favor, verifica tu servicio backend.',
    loginRequiredPurchase: 'Por favor, inicia sesión para comprar artículos.',
    outOfStockShort: 'Lo sentimos, "',
    outOfStockLong: '" está agotado!',
    purchaseSuccess: '¡Comprado exitosamente 1x ',
    thankYouPurchase: '¡Gracias por tu compra! Tu pedido ha sido realizado. (Simulación frontend)',
    cartIsEmpty: '¡Tu carrito está vacío!',
    loginFailed: 'Error al iniciar sesión:',
    registrationFailed: '¡Error de registro! Por favor, verifica tu servidor backend en',
    sellerRegistrationFailed: '¡Error de registro de vendedor! Por favor, verifica tu servidor backend en',
    registeredSuccessLogin: 'Registrado exitosamente. Por favor, inicia sesión.',
    sellerRegisteredSuccessLogin: '¡Vendedor registrado exitosamente! Por favor, inicia sesión.',
    failedToLoadCart: 'Error al cargar el carrito desde el backend. Por favor, verifica tu servicio backend.',
    errorLoadingCartDetails: 'Error al cargar los detalles del carrito.',
    checkoutFailed: 'El pago falló debido a un error del servidor.',
    failedToFetchProducts: '¡Error al obtener productos! ¿Está funcionando tu servidor backend en',
    checkBackendServerAt: 'Por favor, verifica tu servidor backend en',
    previous: 'Anterior',
    next: 'Siguiente',
    page: 'Página',
    settings: 'Configuración',
    orders: 'Pedidos'
  },
  fr: {
    flag: '🇫🇷',
    name: 'Français',
    storeName: 'Magasin de Vêtements Moderne',
    currencySymbol: '€',
    currencyCode: 'EUR',
    loginRegister: 'Se connecter / S\'inscrire',
    signOut: 'Se déconnecter',
    addProduct: '+ Ajouter un produit',
    yourCart: 'Votre Panier',
    total: 'Total',
    proceedToCheckout: 'Passer à la caisse',
    noItemsInCart: 'Aucun article dans le panier.',
    addToCart: 'Ajouter au panier',
    buyNow: 'Acheter maintenant',
    loadingProducts: 'Chargement des produits...',
    allCategories: 'Toutes les catégories',
    men: 'Hommes',
    women: 'Femmes',
    kids: 'Enfants',
    searchProducts: 'Rechercher des produits...',
    close: 'Fermer',
    login: 'Se connecter',
    register: 'S\'inscrire',
    email: 'E-mail',
    password: 'Mot de passe',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    loginHere: 'Connectez-vous ici',
    dontHaveAccount: 'Vous n\'avez pas de compte ?',
    registerHere: 'Inscrivez-vous ici',
    registerAsSeller: 'S\'incrire en tant que vendeur',
    sellerRegistration: 'Inscription du vendeur',
    displayName: 'Nom',
    phone: 'Téléphone',
    gstNumber: 'Numéro GST',
    address: 'Adresse',
    backToLogin: 'Retour à la connexion',
    productName: 'Nom du produit',
    price: 'Prix',
    selectCategory: 'Sélectionner une catégorie',
    imageUrl: 'URL de l\'image',
    stockAvailable: 'Stock disponible',
    size: 'Taille (ex. S, M, L)',
    description: 'Description',
    cancel: 'Annuler',
    addProductButton: 'Ajouter le produit',
    fillAllFields: 'Veuillez remplir tous les champs obligatoires !',
    productAddedSuccess: 'Produit ajouté avec succès !',
    failedToAddProduct: 'Échec de l\'ajout du produit ! Veuillez vérifier votre service backend sur',
    loginRequiredAddToCart: 'Veuillez vous connecter pour ajouter des articles à votre panier.',
    itemAddedToCart: ' ajouté au panier !',
    outOfStock: 'En rupture de stock pour ',
    maxAvailableAdded: ' ou maximum disponible ajouté.',
    loginRequiredManageCart: 'Veuillez vous connecter pour gérer le panier.',
    itemQuantityDecreased: 'Quantité de l\'article diminuée.',
    itemRemovedFromCart: 'Article retiré du panier.',
    failedToRemoveItem: 'Échec du retrait de l\'article du panier. Veuillez vérifier votre service backend.',
    loginRequiredPurchase: 'Veuillez vous connecter pour acheter des articles.',
    outOfStockShort: 'Désolé, "',
    outOfStockLong: '" est en rupture de stock !',
    purchaseSuccess: 'Acheté avec succès 1x ',
    thankYouPurchase: 'Merci pour votre achat ! Votre commande a été passée. (Simulation frontend)',
    cartIsEmpty: 'Votre panier est vide !',
    loginFailed: 'Échec de la connexion :',
    registrationFailed: 'Échec de l\'inscription ! Veuillez vérifier votre serveur backend sur',
    sellerRegistrationFailed: 'Échec de l\'inscription du vendeur ! Veuillez vérifier votre serveur backend sur',
    registeredSuccessLogin: 'Inscrit avec succès. Veuillez vous connecter.',
    sellerRegisteredSuccessLogin: 'Vendeur inscrit avec succès ! Veuillez vous connecter.',
    failedToLoadCart: 'Échec du chargement du panier depuis le backend. Veuillez vérifier votre service backend.',
    errorLoadingCartDetails: 'Erreur lors du chargement des détails du panier.',
    checkoutFailed: 'Le paiement a échoué en raison d\'une erreur de serveur.',
    failedToFetchProducts: 'Échec de la récupération des produits ! Votre serveur backend est-il en cours d\'exécution sur',
    checkBackendServerAt: 'Veuillez vérifier votre serveur backend sur',
    previous: 'Précédent',
    next: 'Suivant',
    page: 'Page',
    settings: 'Paramètres',
    orders: 'Commandes'
  },
  de: {
    flag: '🇩🇪',
    name: 'Deutsch',
    storeName: 'Moderner Bekleidungsgeschäft',
    currencySymbol: '€',
    currencyCode: 'EUR',
    loginRegister: 'Anmelden / Registrieren',
    signOut: 'Abmelden',
    addProduct: '+ Produkt hinzufügen',
    yourCart: 'Ihr Warenkorb',
    total: 'Gesamt',
    proceedToCheckout: 'Zur Kasse gehen',
    noItemsInCart: 'Keine Artikel im Warenkorb.',
    addToCart: 'In den Warenkorb',
    buyNow: 'Jetzt kaufen',
    loadingProducts: 'Produkte werden geladen...',
    allCategories: 'Alle Kategorien',
    men: 'Herren',
    women: 'Damen',
    kids: 'Kinder',
    searchProducts: 'Produkte suchen...',
    close: 'Schließen',
    login: 'Anmelden',
    register: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    alreadyHaveAccount: 'Sie haben bereits ein Konto?',
    loginHere: 'Hier anmelden',
    dontHaveAccount: 'Sie haben noch kein Konto?',
    registerHere: 'Hier registrieren',
    addProducts: 'Produkt hinzufügen',
    sellerRegistration: 'Verkäuferregistrierung',
    displayName: 'Name',
    phone: 'Telefon',
    gstNumber: 'GST-Nummer',
    address: 'Adresse',
    backToLogin: 'Zurück zum Login',
    productName: 'Produktname',
    price: 'Preis',
    selectCategory: 'Kategorie auswählen',
    imageUrl: 'Bild-URL',
    stockAvailable: 'Verfügbarer Bestand',
    size: 'Größe (z.B. S, M, L)',
    description: 'Beschreibung',
    cancel: 'Abbrechen',
    addProductButton: 'Produkt hinzufügen',
    fillAllFields: 'Bitte füllen Sie alle Pflichtfelder aus!',
    productAddedSuccess: 'Produkt erfolgreich hinzugefügt!',
    failedToAddProduct: 'Fehler beim Hinzufügen des Produkts! Bitte überprüfen Sie Ihren Backend-Service unter',
    loginRequiredAddToCart: 'Bitte melden Sie sich an, um Artikel in Ihren Warenkorb zu legen.',
    itemAddedToCart: ' in den Warenkorb gelegt!',
    outOfStock: 'Nicht auf Lager für ',
    maxAvailableAdded: ' oder maximal verfügbar hinzugefügt.',
    loginRequiredManageCart: 'Bitte melden Sie sich an, um den Warenkorb zu verwalten.',
    itemQuantityDecreased: 'Artikelmenge reduziert.',
    itemRemovedFromCart: 'Artikel aus dem Warenkorb entfernt.',
    failedToRemoveItem: 'Fehler beim Entfernen des Artikels aus dem Warenkorb. Bitte überprüfen Sie Ihren Backend-Service.',
    loginRequiredPurchase: 'Bitte melden Sie sich an, um Artikel zu kaufen.',
    outOfStockShort: 'Entschuldigung, "',
    outOfStockLong: '" ist nicht auf Lager!',
    purchaseSuccess: 'Erfolgreich 1x gekauft ',
    thankYouPurchase: 'Vielen Dank für Ihren Einkauf! Ihre Bestellung wurde aufgegeben. (Frontend-Simulation)',
    cartIsEmpty: 'Ihr Warenkorb ist leer!',
    loginFailed: 'Login fehlgeschlagen:',
    registrationFailed: 'Registrierung fehlgeschlagen! Bitte überprüfen Sie Ihren Backend-Server unter',
    sellerRegistrationFailed: 'Verkäuferregistrierung fehlgeschlagen! Bitte überprüfen Sie Ihren Backend-SERVER unter',
    registeredSuccessLogin: 'Erfolgreich registriert. Bitte melden Sie sich an.',
    sellerRegisteredSuccessLogin: 'Verkäufer erfolgreich registriert! Bitte melden Sie sich an.',
    failedToLoadCart: 'Warenkorb konnte vom Backend nicht geladen werden. Bitte überprüfen Sie Ihren Backend-Service.',
    errorLoadingCartDetails: 'Fehler beim Laden der Warenkorbdetails.',
    checkoutFailed: 'Der Checkout ist aufgrund eines Serverfehlers fehlgeschlagen.',
    failedToFetchProducts: 'Produkte konnten nicht abgerufen werden! Läuft Ihr Backend-Server unter',
    checkBackendServerAt: 'Bitte überprüfen Sie Ihren Backend-Server unter',
    previous: 'Zurück',
    next: 'Weiter',
    page: 'Seite',
    settings: 'Einstellungen',
    orders: 'Bestellungen'
  },
  jp: {
    flag: '🇯🇵',
    name: '日本語',
    storeName: 'モダンアパレルストア',
    currencySymbol: '¥',
    currencyCode: 'JPY',
    loginRegister: 'ログイン / 登録',
    signOut: 'サインアウト',
    addProduct: '+ 商品を追加',
    yourCart: 'あなたのカート',
    total: '合計',
    proceedToCheckout: 'チェックアウトに進む',
    noItemsInCart: 'カートに商品はありません。',
    addToCart: 'カートに追加',
    buyNow: '今すぐ購入',
    loadingProducts: '商品を読み込み中...',
    allCategories: 'すべてのカテゴリ',
    men: 'メンズ',
    women: 'ウィメンズ',
    kids: 'キッズ',
    searchProducts: '商品を検索...',
    close: '閉じる',
    login: 'ログイン',
    register: '登録',
    email: 'メールアドレス',
    password: 'パスワード',
    alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
    loginHere: 'こちらでログイン',
    dontHaveAccount: 'アカウントをお持ちではありませんか？',
    registerHere: 'こちらで登録',
    registerAsSeller: '販売者として登録',
    sellerRegistration: '販売者登録',
    displayName: '名前',
    phone: '電話番号',
    gstNumber: 'GST番号', // If applicable, otherwise a placeholder for tax ID
    address: '住所',
    backToLogin: 'ログインに戻る',
    productName: '商品名',
    price: '価格',
    selectCategory: 'カテゴリを選択',
    imageUrl: '画像URL',
    stockAvailable: '在庫あり',
    size: 'サイズ (例: S, M, L)',
    description: '説明',
    cancel: 'キャンセル',
    addProductButton: '商品を追加',
    fillAllFields: 'すべての必須フィールドに入力してください！',
    productAddedSuccess: '商品が正常に追加されました！',
    failedToAddProduct: '商品の追加に失敗しました！バックエンドサービスを確認してください:',
    loginRequiredAddToCart: '商品をカートに追加するにはログインしてください。',
    itemAddedToCart: ' がカートに追加されました！',
    outOfStock: '在庫切れです: ',
    maxAvailableAdded: ' または利用可能な最大数に達しました。',
    loginRequiredManageCart: 'カートを管理するにはログインしてください。',
    itemQuantityDecreased: '商品の数量が減りました。',
    itemRemovedFromCart: '商品がカートから削除されました。',
    failedToRemoveItem: 'カートから商品を削除できませんでした。バックエンドサービスを確認してください。',
    loginRequiredPurchase: '商品を購入するにはログインしてください。',
    outOfStockShort: '申し訳ありませんが、「',
    outOfStockLong: '" is out of stock!',
    purchaseSuccess: '1x の購入に成功しました: ',
    thankYouPurchase: 'ご購入ありがとうございます！ご注文が完了しました。（フロントエンドシミュレーション）',
    cartIsEmpty: 'カートは空です！',
    loginFailed: 'ログイン失敗:',
    registrationFailed: '登録失敗！バックエンドサーバーを確認してください:',
    sellerRegistrationFailed: '販売者登録失敗！バックエンドサーバーを確認してください:',
    registeredSuccessLogin: '登録に成功しました。ログインしてください。',
    sellerRegisteredSuccessLogin: '販売者登録に成功しました！ログインしてください。',
    failedToLoadCart: 'バックエンドからカートを読み込めませんでした。バックエンドサービスを確認してください。',
    errorLoadingCartDetails: 'カート詳細の読み込み中にエラーが発生했습니다。',
    checkoutFailed: 'サーバーエラーによりチェックアウトに失敗했습니다。',
    failedToFetchProducts: '상품을 가져오지 못했습니다! 백엔드 서버가 실행 중입니까?',
    checkBackendServerAt: '백엔드 서버를 확인해주세요:',
    previous: '前へ',
    next: '次へ',
    page: 'ページ',
    settings: '設定',
    orders: '注文'
  },
  kr: {
    flag: '�🇷',
    name: '한국어',
    storeName: '현대 의류 매장',
    currencySymbol: '₩',
    currencyCode: 'KRW',
    loginRegister: '로그인 / 회원가입',
    signOut: '로그아웃',
    addProduct: '+ 상품 추가',
    yourCart: '장바구니',
    total: '총액',
    proceedToCheckout: '결제 진행',
    noItemsInCart: '장바구니에 상품이 없습니다.',
    addToCart: '장바구니에 추가',
    buyNow: '즉시 구매',
    loadingProducts: '상품 로드 중...',
    allCategories: '모든 카테고리',
    men: '남성',
    women: '여성',
    kids: '어린이',
    searchProducts: '상품 검색...',
    close: '닫기',
    login: '로그인',
    register: '회원가입',
    email: '이메일',
    password: '비밀번호',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    loginHere: '여기서 로그인',
    dontHaveAccount: '계정이 없으신가요?',
    registerHere: '여기서 회원가입',
    registerAsSeller: '판매자로 등록',
    sellerRegistration: '판매자 등록',
    displayName: '이름',
    phone: '전화번호',
    gstNumber: 'GST 번호', // If applicable, otherwise a placeholder for tax ID
    address: '주소',
    backToLogin: '로그인으로 돌아가기',
    productName: '상품명',
    price: '가격',
    selectCategory: '카테고리 선택',
    imageUrl: '이미지 URL',
    stockAvailable: '재고 수량',
    size: '사이즈 (예: S, M, L)',
    description: '설명',
    cancel: '취소',
    addProductButton: '상품 추가',
    fillAllFields: '모든 필수 필드를 채워주세요!',
    productAddedSuccess: '상품이 성공적으로 추가되었습니다!',
    failedToAddProduct: '상품 추가 실패! 백엔드 서비스를 확인해주세요:',
    loginRequiredAddToCart: '장바구니에 상품을 추가하려면 로그인해주세요。',
    itemAddedToCart: ' 이(가) 장바구니에 추가되었습니다!',
    outOfStock: '재고 부족: ',
    maxAvailableAdded: ' 또는 최대 수량 추가됨.',
    loginRequiredManageCart: '장바구니를 관리하려면 로그인해주세요。',
    itemQuantityDecreased: '상품 수량이 감소했습니다。',
    itemRemovedFromCart: '상품이 장바구니에서 제거되었습니다。',
    failedToRemoveItem: '장바구니에서 상품을 제거하지 못했습니다. 백엔드 서비스를 확인해주세요。',
    loginRequiredPurchase: '상품을 구매하려면 로그인해주세요。',
    outOfStockShort: '죄송합니다. "',
    outOfStockLong: '" 재고가 없습니다!',
    purchaseSuccess: '1x ',
    thankYouPurchase: '구매해주셔서 감사합니다! 주문이 접수되었습니다. (프론트엔드 시뮬레이션)',
    cartIsEmpty: '장바구니가 비어있습니다!',
    loginFailed: '로그인 실패:',
    registrationFailed: '등록 실패! 백엔드 서버를 확인해주세요:',
    sellerRegistrationFailed: '판매자 등록 실패! 백엔드 서버를 확인해주세요:',
    registeredSuccessLogin: '성공적으로 등록되었습니다. 로그인해주세요。',
    sellerRegisteredSuccessLogin: '판매자가 성공적으로 등록되었습니다! 로그인해주세요。',
    failedToLoadCart: '无法从后端加载购物车。请检查您的后端服务。',
    errorLoadingCartDetails: '장바구니 상세 정보 로드 중 오류 발생。',
    checkoutFailed: '서버 오류로 인해 결제에 실패했습니다。',
    failedToFetchProducts: '상품을 가져오지 못했습니다! 백엔드 서버가 실행 중입니까?',
    checkBackendServerAt: '백엔드 서버를 확인해주세요:',
    previous: '上一页',
    next: '下一页',
    page: '页',
    settings: '设置',
    orders: '订单'
  },
};

// Global Styles Component
const GlobalStyles = () => (
  <style>
    {`
    @keyframes gradient-animation {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .animated-background {
      background: linear-gradient(270deg, #f0f0f0, #ffffff, #f0f0f0);
      background-size: 200% 200%;
      animation: gradient-animation 15s ease infinite;
    }

    @keyframes slide-in-up {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-in-up {
      animation: slide-in-up 0.5s ease-out forwards;
    }

    .product-item {
        opacity: 0;
        animation: slide-in-up 0.5s ease-out forwards;
    }
    .product-item:nth-child(1) { animation-delay: 0.1s; }
    .product-item:nth-child(2) { animation-delay: 0.15s; }
    .product-item:nth-child(3) { animation-delay: 0.2s; }
    .product-item:nth-child(4) { animation-delay: 0.25s; }
    .product-item:nth-child(5) { animation-delay: 0.3s; }
    .product-item:nth-child(6) { animation-delay: 0.35s; }
    .product-item:nth-child(7) { animation-delay: 0.4s; }
    .product-item:nth-child(8) { animation-delay: 0.45s; }
    .product-item:nth-child(9) { animation-delay: 0.5s; }
    .product-item:nth-child(10) { animation-delay: 0.55s; }
    .product-item:nth-child(11) { animation-delay: 0.6s; }
    .product-item:nth-child(12) { animation-delay: 0.65s; }
    .product-item:nth-child(13) { animation-delay: 0.7s; }
    .product-item:nth-child(14) { animation-delay: 0.75s; }
    .product-item:nth-child(15) { animation-delay: 0.8s; }
    `}
  </style>
);

// Reusable Popup Notification Component
const GlobalPopup = ({ message, visible, setVisible }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000); // Popup disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [visible, setVisible]);

  if (!visible) return null;

  return (
    <div className='fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg transition transform animate-bounce'>
      {message}
    </div>
  );
};

// AuthModal Component
const AuthModal = ({ t, setShowLoginModal, handleLogin, handleRegister, handleSellerRegister, email, setEmail, password, setPassword, isRegistering, setIsRegistering, showSellerRegisterModal, setShowSellerRegisterModal, sellerName, setSellerName, sellerPhone, setSellerPhone, sellerGSTNumber, setSellerGSTNumber, sellerAddress, setSellerAddress, loginError }) => {
  const [focusField, setFocusField] = useState(null);
  const [captchaValue, setCaptchaValue] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Function to generate a simple CAPTCHA string
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    setUserCaptchaInput(''); // Clear user input on new CAPTCHA
    setCaptchaError(false); // Clear any previous CAPTCHA error
  };

  useEffect(() => {
    generateCaptcha(); // Generate CAPTCHA on component mount
  }, []);

  // Determines the emoji to display based on input field focus and password content.
  const getEmoji = () => {
    if (focusField === 'email') {
      return '👀'; // Eyes rotating when email field is focused
    } else if (focusField === 'password' && password.length > 0) {
      return '🙈'; // Eyes covered when typing password
    }
    // Default case: neutral face for other scenarios
    return '🙂';
  };

  // Handle form submission (login/register/seller register)
  const handleSubmit = (actionHandler) => {
    if (userCaptchaInput !== captchaValue) {
      setCaptchaError(true);
      generateCaptcha(); // Regenerate CAPTCHA on incorrect attempt
      return;
    }
    // If CAPTCHA is correct, proceed with the actual action
    actionHandler();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50'>
      <div className='relative z-10 w-full max-w-sm p-8 bg-white/90 backdrop-blur-md border border-gray-300 rounded-3xl shadow-2xl overflow-hidden md:p-10'>
        <button
          className='absolute top-4 right-4 text-gray-700 text-xl'
          onClick={() => setShowLoginModal(false)}
        >
          &times;
        </button>
        {showSellerRegisterModal ? (
          // Seller Registration Form
          <>
            <h2 className='text-3xl md:text-4xl font-bold mb-6 text-center text-purple-700 drop-shadow-lg'>
              {t('sellerRegistration')}
            </h2>
            <input
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4'
              type='text'
              placeholder={t('displayName')}
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              required
            />
            <input
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4'
              type='text'
              placeholder={t('phone')}
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              required
            />
            <input
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4'
              type='text'
              placeholder={t('gstNumber')}
              value={sellerGSTNumber}
              onChange={(e) => setSellerGSTNumber(e.target.value)}
              required
            />
            <textarea
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4 resize-y'
              placeholder={t('address')}
              value={sellerAddress}
              onChange={(e) => setSellerAddress(e.target.value)}
              required
            ></textarea>
            <input
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4'
              type='email'
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
              required
            />
            <input
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-6'
              type='password'
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
              required
            />
            {/* CAPTCHA for Seller Registration */}
            <div className='flex items-center justify-between mb-4'>
              <span className='text-xl font-bold text-gray-800 bg-gray-200 px-4 py-2 rounded-lg select-none tracking-wider'>
                {captchaValue}
              </span>
              <button
                type='button'
                onClick={generateCaptcha}
                className='text-sm text-blue-600 hover:underline'
              >
                Refresh CAPTCHA
              </button>
            </div>
            <input
              className={`w-full p-3 bg-gray-100 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-6 ${captchaError ? 'border-red-500' : 'border-gray-300'}`}
              type='text'
              placeholder='Enter CAPTCHA'
              value={userCaptchaInput}
              onChange={(e) => setUserCaptchaInput(e.target.value)}
              required
            />
            {captchaError && <p className='text-red-500 text-sm mb-4'>Incorrect CAPTCHA. Please try again.</p>}

            <button
              className='w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-800'
              onClick={() => handleSubmit(handleSellerRegister)}
            >
              {t('registerAsSeller')}
            </button>
            <button
              className='w-full py-3 px-4 bg-gray-400 hover:bg-gray-500 text-gray-900 font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 mt-3'
              onClick={() => setShowSellerRegisterModal(false)}
            >
              {t('backToLogin')}
            </button>
          </>
        ) : (
          // Regular Login/Register Form
          <>
            {/* Emoji face above login */}
            <div className='flex justify-center text-4xl mb-2'>
              <span className='text-gray-900'>{getEmoji()} <span className='text-xl text-purple-700 ml-2'>@{email || 'username'}</span></span>
            </div>
            <h2 className='text-3xl md:text-4xl font-bold mb-6 text-center text-purple-700 drop-shadow-lg'>
              {t(isRegistering ? 'register' : 'login')}
            </h2>
            <input
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-4'
              type='email'
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
            />
            <input
              className='w-full p-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-6'
              type='password'
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
            />
            {/* CAPTCHA for Login/Register */}
            <div className='flex items-center justify-between mb-4'>
              <span className='text-xl font-bold text-gray-800 bg-gray-200 px-4 py-2 rounded-lg select-none tracking-wider'>
                {captchaValue}
              </span>
              <button
                type='button'
                onClick={generateCaptcha}
                className='text-sm text-blue-600 hover:underline'
              >
                Refresh CAPTCHA
              </button>
            </div>
            <input
              className={`w-full p-3 bg-gray-100 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-gray-900 transition duration-300 ease-in-out mb-6 ${captchaError ? 'border-red-500' : 'border-gray-300'}`}
              type='text'
              placeholder='Enter CAPTCHA'
              value={userCaptchaInput}
              onChange={(e) => setUserCaptchaInput(e.target.value)}
              required
            />
            {captchaError && <p className='text-red-500 text-sm mb-4'>Incorrect CAPTCHA. Please try again.</p>}

            <button
              className='w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-800'
              onClick={() => handleSubmit(isRegistering ? handleRegister : handleLogin)}
            >
              {t(isRegistering ? 'register' : 'login')}
            </button>
            <p className='text-center text-sm text-gray-700 mt-4'>
              {isRegistering ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
              <button
                className='text-purple-700 hover:text-purple-500 font-medium transition duration-300 ease-in-out'
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {t(isRegistering ? 'loginHere' : 'registerHere')}
              </button>
            </p>
            <button
              className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 mt-4'
              onClick={() => setShowSellerRegisterModal(true)}
            >
              {t('registerAsSeller')}
            </button>
          </>
        )}

        {loginError && (
          <div className='absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white text-center p-6 rounded-2xl animate-pulse z-20'>
            <img src='https://i.postimg.cc/SQTP0QMw/download.jpg' alt='Ghost' className='w-32 h-32 animate-bounce mb-4' />
            <p className='text-lg font-semibold text-red-400'>Wrong password... 👻</p>
            <p className='text-sm mt-1 text-purple-200'>The Halloween spirit has awakened!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ProductGrid Component
const ProductGrid = ({ t, products, addToCart, handleBuyNow, setSelectedProduct, category, setCategory, searchQuery, setSearchQuery, isLoading, currentPage, totalPages, handlePageChange, convertPrice, currencySymbol, currencyCode }) => {
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

      {isLoading ? (
        <div className='text-center text-gray-700 text-lg font-semibold my-8 animate-pulse'>
          {t('loadingProducts')}
        </div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {products.map((p) => (
            <div
              key={p._displayId}
              className='border border-gray-300 p-4 rounded-lg bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200 product-item'
            >
              <img
                src={p.image || 'https://via.placeholder.com/150/EEEEEE/000000?text=No+Image'}
                alt={p.name}
                className='w-full h-40 object-cover rounded mb-2 cursor-pointer'
                onClick={() => setSelectedProduct(p)}
              />
              <h3
                className='text-lg font-bold text-gray-900 cursor-pointer'
                onClick={() => setSelectedProduct(p)}
              >
                {p.name}
              </h3>
              <p className='text-sm text-gray-700'>{p.description}</p>
              <p className='text-green-600 font-bold mt-2'>{currencySymbol}{convertPrice(p.price, currencyCode)}</p>
              {p.stockAvailable !== undefined && p.stockAvailable !== null && (
                <p className='text-sm text-gray-600 mt-1'>Stock: {p.stockAvailable}</p>
              )}
              <button
                className='bg-blue-600 text-white mt-2 px-3 py-1 rounded hover:bg-blue-700 transition duration-200'
                onClick={() => addToCart(p._displayId, p._id)}
              >
                {t('addToCart')}
              </button>
              <button
                className='bg-gray-400 text-gray-900 mt-2 ml-2 px-3 py-1 rounded hover:bg-gray-500 transition duration-200'
                onClick={() => handleBuyNow(p)}
              >
                {t('buyNow')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className='flex justify-center items-center mt-8 space-x-4 bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-300 animate-slide-in-up'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200'
        >
          {t('previous')}
        </button>
        <span className='text-lg font-semibold text-gray-900'>
          {t('page')} {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200'
        >
          {t('next')}
        </button>
      </div>
    </>
  );
};

// ProductDetailsModal Component
const ProductDetailsModal = ({ t, selectedProduct, setSelectedProduct, addToCart, sessionId, setPopupMessage, setPopupVisible, setShowLoginModal, convertPrice, currencySymbol, currencyCode }) => {
  if (!selectedProduct) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg border border-gray-300 max-w-md w-full text-gray-900 animate-slide-in-up'>
        <img
          src={selectedProduct.image || 'https://via.placeholder.com/300/EEEEEE/000000?text=No+Image'}
          alt={selectedProduct.name}
          className='w-full h-60 object-cover rounded mb-4'
        />
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>{selectedProduct.name}</h2>
        <p className='text-gray-700 mb-2'>{selectedProduct.description}</p>
        <p className='text-green-600 text-lg font-bold mb-4'>{currencySymbol}{convertPrice(selectedProduct.price, currencyCode)}</p>

        {/* Combined Stock and Size information */}
        <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1'>
          {selectedProduct.stockAvailable !== undefined && selectedProduct.stockAvailable !== null && (
            <span>Stock: {selectedProduct.stockAvailable}</span>
          )}
          {selectedProduct.stockAvailable !== undefined && selectedProduct.stockAvailable !== null && selectedProduct.size && (
            <span className='mx-1'>|</span> // Separator only if both are present
          )}
          {selectedProduct.size && (
            <span>Size: {selectedProduct.size}</span>
          )}
        </div>

        <button
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2 transition duration-200'
          onClick={() => {
            if (!sessionId) {
              setPopupMessage(t('loginRequiredAddToCart'));
              setPopupVisible(true);
              setTimeout(() => setPopupVisible(false), 2000);
              setShowLoginModal(true);
              return;
            }
            addToCart(selectedProduct._displayId, selectedProduct._id);
            setSelectedProduct(null);
          }}
        >
          {t('addToCart')}
        </button>
        <button
          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200'
          onClick={() => setSelectedProduct(null)}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};

// AddProductModal Component
const AddProductModal = ({ t, addMode, userRole, setAddMode, newProduct, setNewProduct, setPopupMessage, setPopupVisible, sessionId, fetchProducts }) => {
  // Changed from 'admin' to 'seller'
  if (!addMode || userRole !== 'seller') return null;

  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stockAvailable' ? parseFloat(value) : value
    }));
  };

  const submitAddProduct = async (e) => {
    e.preventDefault();
    // Ensure all required fields are filled, including size
    if (!newProduct.name || !newProduct.price || !newProduct.category || newProduct.stockAvailable === '' || !newProduct.size) {
      setPopupMessage(t('fillAllFields'));
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      return;
    }
    try {
      // Use API_URL here
      await axios.post(`${API_URL}/api/addproducts`, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockAvailable: parseInt(newProduct.stockAvailable),
        session_id: sessionId,
      });
      setPopupMessage(t('productAddedSuccess'));
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setAddMode(false);
      setNewProduct({
        name: '', description: '', price: '', category: '',
        image: '', stockAvailable: '', size: ''
      });
      fetchProducts();
    } catch (err) {
      console.error('Failed to add product:', err);
      const errorMessage = err.response && err.response.data && err.response.data.error ? err.response.data.error : `${t('failedToAddProduct')} ${API_URL}`;
      setPopupMessage(errorMessage);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 5000);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50'>
      <form
        className='bg-white p-8 rounded-2xl border border-gray-300 shadow-2xl max-w-md w-full text-gray-900'
        onSubmit={submitAddProduct}
      >
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>{t('addProductButton')}</h2>
        <input className='bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' type='text' name='name' placeholder={t('productName')} value={newProduct.name} onChange={handleAddProductChange} required />
        <input className='bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' type='number' name='price' placeholder={t('price')} value={newProduct.price} onChange={handleAddProductChange} min='0' step='0.01' required />
        <select className='bg-gray-100 text-gray-900 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' name='category' value={newProduct.category} onChange={handleAddProductChange} required>
          <option value=''>{t('selectCategory')}</option>
          <option value='men'>{t('men')}</option>
          <option value='women'>{t('women')}</option>
          <option value='kids'>{t('kids')}</option>
        </select>
        <input className='bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' type='text' name='image' placeholder={t('imageUrl')} value={newProduct.image} onChange={handleAddProductChange} />
        <input className='bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' type='number' name='stockAvailable' placeholder={t('stockAvailable')} value={newProduct.stockAvailable} onChange={handleAddProductChange} min='0' step='1' required />
        <input className='bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' type='text' name='size' placeholder={t('size')} value={newProduct.size} onChange={handleAddProductChange} required />
        <div className='flex items-center gap-2 mb-3'>
          <textarea className='bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 p-3 w-full rounded resize-y' name='description' placeholder={t('description')} value={newProduct.description} onChange={handleAddProductChange} rows='4' />
        </div>
        <div className='flex justify-between mt-4'>
          <button type='button' className='bg-gray-400 text-gray-900 px-4 py-2 rounded hover:bg-gray-500 transition duration-200' onClick={() => setAddMode(false)}>{t('cancel')}</button>
          <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200'>{t('addProductButton')}</button>
        </div>
      </form>
    </div>
  );
};

// CartDrawer Component
const CartDrawer = ({ t, cartOpen, setCartOpen, cartItems, removeFromCart, addToCart, getTotalPrice, setPopupMessage, setPopupVisible, setCartItems, sessionId, products, convertPrice, currencySymbol, currencyCode }) => {
  // Function to fetch full product details for items in cart from the product service
  const fetchCartProductDetails = async (cartData) => {
    const productIds = Object.keys(cartData);
    if (productIds.length === 0) return [];

    try {
      const detailedCartItems = await Promise.all(
        productIds.map(async (productId) => {
          const product = products.find(p => p._id === productId);
          if (product) {
            return { product: product, quantity: cartData[productId] };
          }
          return null;
        })
      );
      return detailedCartItems.filter(item => item !== null);
    } catch (error) {
      console.error('Error fetching cart product details:', error);
      setPopupMessage(t('errorLoadingCartDetails'));
      setPopupVisible(true);
      return [];
    }
  };

  useEffect(() => {
    const syncCartWithBackend = async () => {
      if (sessionId && cartOpen) {
        try {
          const res = await axios.get(`${API_URL}/api/cart/${sessionId}`); // Use API_URL
          const backendCartData = res.data;

          const newCartItems = await fetchCartProductDetails(backendCartData);
          setCartItems(newCartItems);

        } catch (err) {
          console.error('Error fetching cart from backend:', err);
          const errorMessage = err.response?.data?.error || `${t('failedToLoadCart')} ${API_URL}`;
          setPopupMessage(errorMessage);
          setPopupVisible(true);
        }
      }
    };

    syncCartWithBackend();
  }, [sessionId, cartOpen, products, t, setPopupMessage, setPopupVisible, setCartItems]); // Added dependencies

  const currentTotalPrice = getTotalPrice();

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white/90 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out z-40
        ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className='p-6 h-full flex flex-col'>
        <div className='flex justify-between items-center mb-6 pb-4 border-b border-gray-300'>
          <h2 className='text-2xl font-bold text-gray-900'>🛒 {t('yourCart')}</h2>
          <button
            className='text-red-600 hover:text-red-800 text-3xl font-bold'
            onClick={() => setCartOpen(false)}
          >
            &times;
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className='text-gray-700 flex-grow text-center flex items-center justify-center'>{t('noItemsInCart')}</p>
        ) : (
          <div className='flex-grow overflow-y-auto pr-2'>
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className='flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3 shadow-md'
              >
                <img
                    src={item.product.image || 'https://via.placeholder.com/50/EEEEEE/000000?text=Item'}
                    alt={item.product.name}
                    className='w-16 h-16 object-cover rounded-md mr-3'
                />
                <div className='flex-grow'>
                  <p className='text-gray-900 font-semibold'>{item.product.name}</p>
                  <p className='text-green-600 text-sm'>{currencySymbol}{convertPrice(item.product.price, currencyCode)}</p>
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    className='bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200'
                    onClick={() => removeFromCart(item.product._displayId, item.product._id)}
                  >
                    -
                  </button>
                  <span className='text-lg font-bold text-gray-900'>{item.quantity}</span>
                  <button
                    className='bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition duration-200'
                    onClick={() => addToCart(item.product._displayId, item.product._id)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='mt-auto pt-4 border-t border-gray-300'>
            <div className='flex justify-between items-center text-xl font-bold text-gray-900 mb-4'>
                <span>{t('total')}:</span>
                <span className='text-green-600'>{currencySymbol}{convertPrice(currentTotalPrice, currencyCode)}</span>
            </div>
            <button
                className='w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200'
                onClick={async () => {
                    if (cartItems.length > 0) {
                        try {
                            await Promise.all(cartItems.map(item =>
                                axios.delete(`${API_URL}/api/cart`, { data: { session_id: sessionId, product_id: item.product._id } }) // Use API_URL
                            ));
                            setPopupMessage(t('thankYouPurchase'));
                            setPopupVisible(true);
                            setCartItems([]);
                            setCartOpen(false);
                            setTimeout(() => setPopupVisible(false), 3000);
                            console.log('Checkout completed locally and cart cleared via Cart Service. REMINDER: Implement a full Order Service!');
                        } catch (error) {
                            console.error('Error during checkout:', error);
                            const errorMessage = error.response?.data?.error || `${t('checkoutFailed')} ${API_URL}`;
                            setPopupMessage(errorMessage);
                            setPopupVisible(true);
                        }
                    } else {
                        setPopupMessage(t('cartIsEmpty'));
                        setPopupVisible(true);
                    }
                }}
            >
                {t('proceedToCheckout')}
            </button>
        </div>
      </div>
    </div>
  );
};

// SettingsModal Component
const SettingsModal = ({ t, showSettingsModal, setShowSettingsModal, userEmail, userRole }) => {
  if (!showSettingsModal) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50'>
      <div className='relative z-10 w-full max-w-sm p-8 bg-white/90 backdrop-blur-md border border-gray-300 rounded-3xl shadow-2xl overflow-hidden md:p-10'>
        <button
          className='absolute top-4 right-4 text-gray-700 text-xl'
          onClick={() => setShowSettingsModal(false)}
        >
          &times;
        </button>
        <h2 className='text-3xl md:text-4xl font-bold mb-6 text-center text-purple-700 drop-shadow-lg'>
          Account Settings
        </h2>
        <div className='text-gray-800 text-lg space-y-4'>
          <p><strong>Email:</strong> {userEmail}</p>
          <p><strong>Role:</strong> {userRole}</p>
          {/* Add more account details here if available from backend */}
        </div>
        <button
          className='w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-800 mt-6'
          onClick={() => setShowSettingsModal(false)}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};


// Main App Component (acting as the container/shell)
function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role'));
  const [sellerEmail, setSellerEmail] = useState(localStorage.getItem('user_email'));

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const [showSellerRegisterModal, setShowSellerRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // New state for settings modal

  const [addMode, setAddMode] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: '',
    image: '', stockAvailable: '', size: ''
  });

  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerGSTNumber, setSellerGSTNumber] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  // Language state and translation function
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const t = (key) => translations[language][key] || key;

  // Handles user login by sending credentials to the backend.
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password }); // Use API_URL
      localStorage.setItem('session_id', res.data.session_id);
      localStorage.setItem('user_role', res.data.role);
      localStorage.setItem('user_email', res.data.user_email); // Now user_email is returned by backend
      setSessionId(res.data.session_id);
      setUserRole(res.data.role);
      setSellerEmail(res.data.user_email); // Ensure sellerEmail is set on login
      setShowLoginModal(false);
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError(true);
      setPopupMessage(`${t('loginFailed')} ${err.message}. ${t('checkBackendServerAt')} ${API_URL}`); // Use API_URL
      setPopupVisible(true);
    }
  };

  // Handles regular user registration.
  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/api/register`, { email, password }); // Use API_URL
      setPopupMessage(t('registeredSuccessLogin'));
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setIsRegistering(false);
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage = err.response && err.response.data && err.response.data.error ? err.response.data.error : `${t('registrationFailed')} ${API_URL}`; // Use API_URL
      setPopupMessage(errorMessage);
      setPopupVisible(true);
    }
  };

  // Handles seller registration.
  const handleSellerRegister = async () => {
    try {
      await axios.post(`${API_URL}/api/selleregister`, { // Use API_URL
        email, password, SellerName: sellerName, SellerPhone: sellerPhone,
        SellerGSTNumber: sellerGSTNumber, SellerAddres: sellerAddress,
      });
      setPopupMessage(t('sellerRegisteredSuccessLogin'));
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2000);
      setShowSellerRegisterModal(false);
      setEmail(''); setPassword(''); setSellerName(''); setSellerPhone('');
      setSellerGSTNumber(''); setSellerAddress('');
    } catch (err) {
      console.error('Seller registration failed:', err);
      const errorMessage = err.response && err.response.data && err.response.data.error ? err.response.data.error : `${t('sellerRegistrationFailed')} ${API_URL}`; // Use API_URL
      setPopupMessage(errorMessage);
      setPopupVisible(true);
    }
  };

  // Handles user logout.
  const handleLogout = () => {
    localStorage.removeItem('session_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    setSessionId(null);
    setUserRole(null);
    setSellerEmail(null);
    setCartItems([]);
    setShowLoginModal(false);
  };

  // Fetches products from the backend with pagination parameters.
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/api/products?category=${category}&q=${searchQuery}&page=${currentPage}&limit=${productsPerPage}`; // Use API_URL
      // If the user is a 'seller', filter products by their email
      // Changed from 'admin' to 'seller'
      if (userRole === 'seller' && sellerEmail) {
        url += `&session_id=${sessionId}`; // Pass session_id to backend for seller filtering
      }
      console.log(`Fetching products from: ${url}`); // Log the URL for debugging
      const res = await axios.get(url);
      console.log('Raw response data from product service:', res.data);

      const fetchedProducts = Array.isArray(res.data) ? res.data : [];
      const fetchedTotalProducts = fetchedProducts.length;

      const processedProducts = fetchedProducts.map(product => ({
        ...product,
        image: product.image || 'https://via.placeholder.com/150/222222/FFFFFF?text=No+Image',
        stockAvailable: parseInt(product.stockavailable),
        size: product.size,
        _displayId: product._id || (Date.now().toString() + Math.random().toString(36).substring(2))
      }));
      setProducts(processedProducts);
      setTotalProductsCount(fetchedTotalProducts);

    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err.response && err.response.data && err.response.data.error ? err.response.data.error : `${t('failedToFetchProducts')} ${API_URL}?`; // Use API_URL
      setPopupMessage(errorMessage);
      setPopupVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for changing pagination page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalProductsCount / productsPerPage);

  // Add to Cart Logic (now interacts with Cart Service)
  const addToCart = async (displayId, backendProductId) => {
    if (!sessionId) {
      setPopupMessage(t('loginRequiredAddToCart'));
      setPopupVisible(true);
      setShowLoginModal(true);
      return;
    }
    const productToAdd = products.find((p) => p._displayId === displayId);
    if (!productToAdd) return;

    const existingCartItem = cartItems.find((item) => item.product._id === backendProductId);
    const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    if (productToAdd.stockAvailable !== undefined && productToAdd.stockAvailable !== null && currentQuantityInCart >= productToAdd.stockAvailable) {
      setPopupMessage(`${t('outOfStock')}${productToAdd.name}${t('maxAvailableAdded')}`);
      setPopupVisible(true);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/cart`, { // Use API_URL
        session_id: sessionId,
        product_id: backendProductId,
        quantity: 1
      });

      const cartRes = await axios.get(`${API_URL}/api/cart/${sessionId}`); // Use API_URL
      const backendCartData = cartRes.data;
      const newCartItems = await Promise.all(
          Object.keys(backendCartData).map(async (pid) => {
              const p = products.find(prod => prod._id === pid);
              return p ? { product: p, quantity: backendCartData[pid] } : null;
          })
      );
      setCartItems(newCartItems.filter(item => item !== null));

      setPopupMessage(`${productToAdd.name}${t('itemAddedToCart')}`);
      setPopupVisible(true);

    } catch (err) {
      console.error('Error adding to cart via service:', err);
      const errorMessage = err.response?.data?.error || `${t('failedToAddItemToCart')} ${API_URL}`; // Use API_URL
      setPopupMessage(errorMessage);
      setPopupVisible(true);
    }
  };

  // Remove from Cart Logic (now interacts with Cart Service)
  const removeFromCart = async (displayId, backendProductId) => {
    if (!sessionId) {
      setPopupMessage(t('loginRequiredManageCart'));
      setPopupVisible(true);
      setShowLoginModal(true);
      return;
    }

    const existingCartItem = cartItems.find((item) => item.product._id === backendProductId);
    if (!existingCartItem) return;

    try {
      if (existingCartItem.quantity > 1) {
        await axios.put(`${API_URL}/api/cart`, { // Use API_URL
          session_id: sessionId,
          product_id: backendProductId,
          quantity: existingCartItem.quantity - 1
        });
        setPopupMessage(t('itemQuantityDecreased'));
      } else {
        await axios.delete(`${API_URL}/api/cart`, { data: { session_id: sessionId, product_id: backendProductId } }); // Use API_URL
        setPopupMessage(t('itemRemovedFromCart'));
      }

      const cartRes = await axios.get(`${API_URL}/api/cart/${sessionId}`); // Use API_URL
      const backendCartData = cartRes.data;
      const newCartItems = await Promise.all(
          Object.keys(backendCartData).map(async (pid) => {
              const p = products.find(prod => prod._id === pid);
              return p ? { product: p, quantity: backendCartData[pid] } : null;
          })
      );
      setCartItems(newCartItems.filter(item => item !== null));
      setPopupVisible(true);

    } catch (err) {
      console.error('Error removing from cart via service:', err);
      const errorMessage = err.response?.data?.error || `${t('failedToRemoveItem')} ${API_URL}`; // Use API_URL
      setPopupMessage(errorMessage);
      setPopupVisible(true);
    }
  };

  // Handle Buy Now Logic (no change to backend interaction yet as it's local stock decrement)
  const handleBuyNow = (productToBuy) => {
    if (!sessionId) {
      setPopupMessage(t('loginRequiredPurchase'));
      setPopupVisible(true);
      setShowLoginModal(true);
      return;
    }

    if (productToBuy.stockAvailable <= 0) {
      setPopupMessage(`${t('outOfStockShort')}${productToBuy.name}${t('outOfStockLong')}`);
      setPopupVisible(true);
      return;
    }

    const updatedProducts = products.map(p => p._displayId === productToBuy._displayId ? { ...p, stockAvailable: p.stockAvailable - 1 } : p);
    setProducts(updatedProducts);
    setSelectedProduct(null);

    setPopupMessage(`${t('purchaseSuccess')}${productToBuy.name}!`);
    setPopupVisible(true);
  };

  // Calculate Total Price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Effects
  useEffect(() => {
    fetchProducts();
  }, [category, searchQuery, userRole, sellerEmail, language, currentPage]);

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  // Save selected language to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <div className='min-h-screen animated-background text-gray-900'>
      <GlobalStyles />
      <div className='relative z-10 p-4'>
        {/* Header */}
        <div className='flex justify-between items-center mb-4 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-md border border-gray-300'>
          <h1 className='text-2xl font-bold text-gray-900'>🛍️ {t('storeName')}</h1>
          <div className='flex items-center gap-4'>
            {/* Language Selector */}
            <select
              className='bg-white text-gray-900 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.keys(translations).map((langKey) => (
                <option key={langKey} value={langKey}>
                  {translations[langKey].flag} {translations[langKey].name}
                </option>
              ))}
            </select>

            {sessionId ? (
              <>
                {/* Display logged-in user's email and role for debugging */}
                <span className='text-sm text-gray-700'>
                  {sellerEmail} ({userRole})
                </span>

                {/* Always show Settings for logged-in users */}
                <button
                  className='bg-gray-400 text-gray-900 px-3 py-2 rounded hover:bg-gray-500 transition duration-200'
                  onClick={() => setShowSettingsModal(true)}
                >
                  ⚙️ {t('settings')}
                </button>

                {/* Show Orders and Cart only if not seller role */}
                {userRole !== 'seller' && ( // Changed from 'admin' to 'seller'
                  <>
                    <button
                      className='bg-gray-400 text-gray-900 px-3 py-2 rounded hover:bg-gray-500 transition duration-200'
                      onClick={() => setPopupMessage('Orders clicked! (Functionality to be added)') && setPopupVisible(true)}
                    >
                      📦 {t('orders')}
                    </button>
                    <button
                      className='bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition duration-200'
                      onClick={() => setCartOpen(!cartOpen)}
                    >
                      🛒 {cartItems.length}
                    </button>
                  </>
                )}

                {/* Show Add Product only if seller role */}
                {userRole === 'seller' && ( // Changed from 'admin' to 'seller'
                  <button
                    className='bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition duration-200'
                    onClick={() => setAddMode(true)}
                  >
                    {t('addProduct')}
                  </button>
                )}
                <button
                  className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200'
                  onClick={handleLogout}
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <button
                className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition duration-300'
                onClick={() => setShowLoginModal(true)}
              >
                {t('loginRegister')}
              </button>
            )}
          </div>
        </div>

        {/* Product Grid Component */}
        <ProductGrid
          t={t}
          products={products}
          addToCart={addToCart}
          handleBuyNow={handleBuyNow}
          setSelectedProduct={setSelectedProduct}
          category={category}
          setCategory={setCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          convertPrice={convertPrice}
          currencySymbol={t('currencySymbol')}
          currencyCode={t('currencyCode')}
        />

        {/* Product Details Modal Component */}
        <ProductDetailsModal
          t={t}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          addToCart={addToCart}
          sessionId={sessionId}
          setPopupMessage={setPopupMessage}
          setPopupVisible={setPopupVisible}
          setShowLoginModal={setShowLoginModal}
          convertPrice={convertPrice}
          currencySymbol={t('currencySymbol')}
          currencyCode={t('currencyCode')}
        />

        {/* Add Product Modal Component */}
        <AddProductModal
          t={t}
          addMode={addMode}
          userRole={userRole}
          setAddMode={setAddMode}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          setPopupMessage={setPopupMessage}
          setPopupVisible={setPopupVisible}
          sessionId={sessionId}
          fetchProducts={fetchProducts}
        />

        {/* Cart Drawer Component */}
        <CartDrawer
          t={t}
          cartOpen={cartOpen}
          setCartOpen={setCartOpen}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          addToCart={addToCart}
          getTotalPrice={getTotalPrice}
          setPopupMessage={setPopupMessage}
          setPopupVisible={setPopupVisible}
          setCartItems={setCartItems}
          sessionId={sessionId}
          products={products}
          convertPrice={convertPrice}
          currencySymbol={t('currencySymbol')}
          currencyCode={t('currencyCode')}
        />

        {/* Global Popup Notification Component */}
        <GlobalPopup message={popupMessage} visible={popupVisible} setVisible={setPopupVisible} />
      </div>

      {/* Auth Modal Component */}
      {showLoginModal && (
        <AuthModal
          t={t}
          setShowLoginModal={setShowLoginModal}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          handleSellerRegister={handleSellerRegister}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          showSellerRegisterModal={showSellerRegisterModal}
          setShowSellerRegisterModal={setShowSellerRegisterModal}
          sellerName={sellerName}
          setSellerName={setSellerName}
          sellerPhone={sellerPhone}
          setSellerPhone={setSellerPhone}
          sellerGSTNumber={sellerGSTNumber}
          setSellerGSTNumber={setSellerGSTNumber}
          sellerAddress={sellerAddress}
          setSellerAddress={setSellerAddress}
          loginError={loginError}
        />
      )}

      {/* Settings Modal Component */}
      {showSettingsModal && (
        <SettingsModal
          t={t}
          showSettingsModal={showSettingsModal}
          setShowSettingsModal={setShowSettingsModal}
          userEmail={sellerEmail}
          userRole={userRole}
        />
      )}

      {/* Footer */}
      <footer className='w-full text-center py-4 bg-white/70 backdrop-blur-sm text-gray-700 mt-8 rounded-lg shadow-md border border-gray-300'>
        <p>&copy; 2025 All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
