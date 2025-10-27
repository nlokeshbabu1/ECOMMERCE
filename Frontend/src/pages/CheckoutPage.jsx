import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = window.API_BASE_URL || '';

const CheckoutPage = ({ t, cartItems = [], getTotalPrice, currencySymbol, showPopup, sessionId }) => {
    const navigate = useNavigate();
    const [shippingInfo, setShippingInfo] = useState({ 
        name: '', 
        address: '', 
        city: '', 
        postalCode: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cod'); // cod = Cash on Delivery
    const [currentStep, setCurrentStep] = useState(1); // 1: shipping, 2: payment, 3: confirm, 4: success
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Validate that user is logged in
    useEffect(() => {
        if (!sessionId) {
            showPopup('Please log in to proceed with checkout', 'error');
            navigate('/');
        }
    }, [sessionId, navigate, showPopup]);

    const handleShippingChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        if (!sessionId) {
            showPopup('Session expired. Please log in again.', 'error');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                session_id: sessionId,
                shipping_address: shippingInfo,
                payment_method: paymentMethod,
                items: cartItems.map(item => ({
                    product_id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity
                })),
                total_amount: getTotalPrice()
            };

            const response = await axios.post(`${API_URL}/api/orders`, orderData);
            
            if (response.status === 201) {
                setOrderId(response.data.order_id);
                setOrderPlaced(true);
                setCurrentStep(4); // Move to success page
                showPopup('Order placed successfully!', 'success');
            } else {
                showPopup('Failed to place order. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showPopup(error.response?.data?.error || 'Failed to place order. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Order summary component
    const OrderSummary = () => (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
                {cartItems.map(item => (
                    item && item.product && (
                        <div key={item.product._id} className="flex justify-between items-center border-b pb-3">
                            <div>
                                <span className="font-medium">{item.product.name}</span>
                                <span className="text-gray-600 text-sm block">Qty: {item.quantity}</span>
                            </div>
                            <span className="text-gray-600">{currencySymbol}{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    )
                ))}
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-purple-700">{currencySymbol}{getTotalPrice().toFixed(2)}</span>
                </div>
            </div>
        </div>
    );

    // Step 1: Shipping Information
    const ShippingStep = () => (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Shipping Information</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                        name="name" 
                        placeholder="John Doe" 
                        value={shippingInfo.name}
                        onChange={handleShippingChange}
                        required 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                        name="phone" 
                        placeholder="+1 (555) 123-4567" 
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        required 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input 
                        name="address" 
                        placeholder="123 Main Street" 
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        required 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input 
                            name="city" 
                            placeholder="New York" 
                            value={shippingInfo.city}
                            onChange={handleShippingChange}
                            required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input 
                            name="postalCode" 
                            placeholder="10001" 
                            value={shippingInfo.postalCode}
                            onChange={handleShippingChange}
                            required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300"
                        />
                    </div>
                </div>
            </div>
            
            <button
                onClick={() => setCurrentStep(2)}
                disabled={!shippingInfo.name || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.phone}
                className="w-full mt-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Continue to Payment
            </button>
        </div>
    );

    // Step 2: Payment Method
    const PaymentStep = () => (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Payment Method</h2>
            
            <div className="space-y-4">
                <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        paymentMethod === 'cod' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                >
                    <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                            paymentMethod === 'cod' ? 'border-purple-500' : 'border-gray-400'
                        }`}>
                            {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                        </div>
                        <div>
                            <h3 className="font-medium">Cash on Delivery</h3>
                            <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                        </div>
                    </div>
                </div>
                
                <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        paymentMethod === 'card' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                >
                    <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                            paymentMethod === 'card' ? 'border-purple-500' : 'border-gray-400'
                        }`}>
                            {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                        </div>
                        <div>
                            <h3 className="font-medium">Credit/Debit Card</h3>
                            <p className="text-sm text-gray-600">Pay now with your card</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between mt-8">
                <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                    Back
                </button>
                <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md"
                >
                    Continue to Confirmation
                </button>
            </div>
        </div>
    );

    // Step 3: Order Confirmation
    const ConfirmStep = () => (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Confirm Order</h2>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{shippingInfo.name}</p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.city}, {shippingInfo.postalCode}</p>
                    <p>{shippingInfo.phone}</p>
                </div>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                        {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                    </p>
                </div>
            </div>
            
            <div className="flex justify-between mt-8">
                <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                    Back
                </button>
                <button
                    onClick={handlePlaceOrder}
                    disabled={loading || !sessionId}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        `Place Order - ${currencySymbol}${getTotalPrice().toFixed(2)}`
                    )}
                </button>
            </div>
        </div>
    );

    // Step 4: Order Success
    const SuccessStep = () => (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 inline-block text-left">
                <p><span className="font-medium">Order ID:</span> #{orderId}</p>
                <p><span className="font-medium">Total:</span> {currencySymbol}{getTotalPrice().toFixed(2)}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md"
                >
                    Continue Shopping
                </button>
                <button
                    onClick={() => navigate('/orders')}
                    className="flex-1 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md"
                >
                    View Order
                </button>
            </div>
        </div>
    );

    // Progress indicator
    const ProgressIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            <div className="flex items-center w-full max-w-md">
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center w-full">
                        <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                currentStep >= step 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            {step}
                        </div>
                        {step < 4 && (
                            <div className={`flex-1 h-1 mx-2 ${
                                currentStep > step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                            }`}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Checkout</h1>
            <p className="text-center text-gray-600 mb-8">Complete your purchase</p>
            
            <ProgressIndicator />
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {currentStep === 1 && <ShippingStep />}
                    {currentStep === 2 && <PaymentStep />}
                    {currentStep === 3 && <ConfirmStep />}
                    {currentStep === 4 && <SuccessStep />}
                </div>
                
                <div className="lg:col-span-1">
                    <OrderSummary />
                    
                    {currentStep > 1 && (
                        <div className="mt-6 bg-white p-4 rounded-xl shadow-md border border-gray-200">
                            <h3 className="font-semibold mb-2">Change Shipping Info</h3>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                            >
                                Edit Shipping Details
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
