import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ---  ACTION REQUIRED: REPLACE THIS KEY ---
// This is the most likely cause of the error.
// Get your "Publishable key" from your Stripe Dashboard under Developers > API keys.
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');

const CheckoutForm = ({ getTotalPrice, showPopup, currencySymbol }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [shippingInfo, setShippingInfo] = useState({ name: '', address: '', city: '', postalCode: '' });

    const handleShippingChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        try {
            const { data: { clientSecret } } = await axios.post(`${API_URL}/api/create-payment-intent`, {
                amount: Math.round(getTotalPrice() * 100), // Stripe needs the amount in cents
            });

            const payload = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: { name: shippingInfo.name, address: { line1: shippingInfo.address, city: shippingInfo.city, postal_code: shippingInfo.postalCode } },
                },
            });

            if (payload.error) {
                setError(`Payment failed: ${payload.error.message}`);
                setProcessing(false);
            } else {
                setError(null);
                setProcessing(false);
                showPopup('Payment Successful!', 'success');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
            <div className="space-y-4">
                <input name="name" placeholder="Full Name" onChange={handleShippingChange} required className="w-full bg-gray-100 p-3 rounded-lg border-transparent focus:ring-2 focus:ring-purple-500" />
                <input name="address" placeholder="Address" onChange={handleShippingChange} required className="w-full bg-gray-100 p-3 rounded-lg border-transparent focus:ring-2 focus:ring-purple-500" />
                <input name="city" placeholder="City" onChange={handleShippingChange} required className="w-full bg-gray-100 p-3 rounded-lg border-transparent focus:ring-2 focus:ring-purple-500" />
                <input name="postalCode" placeholder="Postal Code" onChange={handleShippingChange} required className="w-full bg-gray-100 p-3 rounded-lg border-transparent focus:ring-2 focus:ring-purple-500" />
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-6">Payment Details</h2>
            <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                <CardElement options={{ style: { base: { fontSize: '16px', color: '#32325d' } } }} />
            </div>
            
            {error && <div className="text-red-500 mt-4 font-semibold">{error}</div>}

            <button type="submit" disabled={!stripe || processing} className="w-full mt-6 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400">
                {processing ? 'Processing...' : `Pay ${currencySymbol}${getTotalPrice()}`}
            </button>
        </form>
    );
};

const CheckoutPage = ({ cartItems, getTotalPrice, currencySymbol, showPopup }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-purple-700 mb-8 text-center">Checkout</h1>
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        {cartItems.map(item => (
                            <div key={item.product._id} className="flex justify-between items-center">
                                <span className="font-medium">{item.product.name} (x{item.quantity})</span>
                                <span className="text-gray-600">{currencySymbol}{item.product.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="border-t pt-4 mt-4 flex justify-between items-center font-bold text-xl">
                            <span>Total</span>
                            <span>{currencySymbol}{getTotalPrice()}</span>
                        </div>
                    </div>
                </div>
                <Elements stripe={stripePromise}>
                    <CheckoutForm getTotalPrice={getTotalPrice} currencySymbol={currencySymbol} showPopup={showPopup} />
                </Elements>
            </div>
        </div>
    );
};

export default CheckoutPage;
