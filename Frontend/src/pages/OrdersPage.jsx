import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = window.API_BASE_URL || '';

const OrdersPage = ({ t, sessionId, showPopup }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      showPopup('Please log in to view your orders', 'error');
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders?session_id=${sessionId}`);
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        showPopup('Failed to fetch orders. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [sessionId, navigate, showPopup]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Order # {order._id}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(parseInt(order.created_at.$date.$numberLong)).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Shipping Address</h4>
                  <p className="text-gray-600">
                    {order.shipping_address?.name}<br />
                    {order.shipping_address?.address}<br />
                    {order.shipping_address?.city}, {order.shipping_address?.postalCode}<br />
                    {order.shipping_address?.phone}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span>
                          {item.name} <span className="text-gray-500">x{item.quantity}</span>
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total: ${order.total_amount.toFixed(2)}</span>
                  <span className="text-sm text-gray-600">Payment: {order.payment_method}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;