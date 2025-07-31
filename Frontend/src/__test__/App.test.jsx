import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom'; // For custom matchers like toBeInTheDocument
import axios from 'axios';
import App from '../App'; // Import the main App component

// Mock axios to prevent actual API calls during tests
jest.mock('axios');

// Mock localStorage for session management
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the API_URL to avoid network issues in tests
const API_URL = 'http://localhost:5000';

// Mock the CAPTCHA generation to be predictable for testing purposes
// This ensures the CAPTCHA value is always 'TEST12'
const mockUseState = React.useState;
jest.spyOn(React, 'useState').mockImplementation((initialState) => {
  if (typeof initialState === 'function' && initialState.name === 'generateCaptcha') {
    return mockUseState('TEST12'); // Always return 'TEST12' for captchaValue
  }
  return mockUseState(initialState);
});


describe('App Component', () => {
  // Reset mocks and localStorage before each test
  beforeEach(() => {
    axios.post.mockClear();
    axios.get.mockClear();
    axios.put.mockClear();
    axios.delete.mockClear();
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();

    // Mock initial product fetch for most tests unless specifically overridden
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/products')) {
        return Promise.resolve({
          data: [
            { _id: 'p1', _displayId: 'dp1', name: 'Shirt', price: 25, category: 'men', stockAvailable: 10, image: 'shirt.jpg', size: 'M' },
            { _id: 'p2', _displayId: 'dp2', name: 'Dress', price: 50, category: 'women', stockAvailable: 5, image: 'dress.jpg', size: 'S' },
          ],
        });
      }
      // Default mock for other GET requests if not specifically handled
      return Promise.resolve({ data: {} });
    });
  });

  // Restore original useState after all tests
  afterAll(() => {
    jest.restoreAllMocks();
  });

  // --- Initial Render and Basic Layout Tests ---
  test('renders store name and login/register button initially', async () => {
    render(<App />);
    expect(screen.getByText(/Modern Clothing Store/i)).toBeInTheDocument();
    expect(screen.getByText(/Login \/ Register/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Shirt/i)).toBeInTheDocument(); // Products should load
    });
  });

  test('displays loading message when products are being fetched', async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // Mock an永远 pending request
    render(<App />);
    expect(screen.getByText(/Loading products.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/Shirt/i)).not.toBeInTheDocument(); // Products should not be there yet
    });
  });

  // --- Authentication Flow Tests ---
  test('opens and closes AuthModal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('×')); // Close button
    await waitFor(() => {
      expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    });
  });

  test('handles successful user login', async () => {
    axios.post.mockResolvedValueOnce({
      data: { session_id: 'user_session_123', role: 'user', user_email: 'user@example.com' },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/login`, {
        email: 'user@example.com',
        password: 'password123',
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('session_id', 'user_session_123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_role', 'user');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_email', 'user@example.com');
      expect(screen.getByText(/Login successful!/i)).toBeInTheDocument();
      expect(screen.queryByText(/Login \/ Register/i)).not.toBeInTheDocument(); // Modal closes
      expect(screen.getByText(/user@example.com \(user\)/i)).toBeInTheDocument(); // User info displayed
    });
  });

  test('handles failed user login', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Login/i })[0]);


    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument(); // Popup message
      expect(screen.getByText(/Login/i)).toBeInTheDocument(); // Modal remains open
    });
  });

  test('handles successful user registration', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'User registered' } });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.click(screen.getByText(/Register here/i)); // Switch to register form

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/register`, {
        email: 'new@example.com',
        password: 'NewPass123!',
      });
      expect(screen.getByText(/Registered successfully. Please log in./i)).toBeInTheDocument();
      expect(screen.getByText(/Login/i)).toBeInTheDocument(); // Should switch back to login form
    });
  });

  test('handles successful seller registration', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Seller registered successfully' } });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.click(screen.getByText(/Register as Seller/i)); // Switch to seller register form

    fireEvent.change(screen.getByPlaceholderText(/Name/i), { target: { value: 'Test Seller' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/GST Number/i), { target: { value: 'GST123' } });
    fireEvent.change(screen.getByPlaceholderText(/Address/i), { target: { value: '123 Seller Road' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'seller@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'SellerPass1!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Register as Seller/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/selleregister`, {
        email: 'seller@example.com',
        password: 'SellerPass1!',
        SellerName: 'Test Seller',
        SellerPhone: '1234567890',
        SellerGSTNumber: 'GST123',
        SellerAddres: '123 Seller Road',
      });
      expect(screen.getByText(/Seller registered successfully! Please login./i)).toBeInTheDocument();
      expect(screen.queryByText(/Seller Registration/i)).not.toBeInTheDocument(); // Modal closes
    });
  });

  test('displays error for incorrect CAPTCHA on login', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'WRONG' } }); // Incorrect CAPTCHA
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Incorrect CAPTCHA. Please try again./i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled(); // API call should not be made
  });

  test('displays email validation error', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address./i)).toBeInTheDocument();
    });
  });

  test('displays password strength for registration', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.click(screen.getByText(/Register here/i)); // Switch to register form

    const passwordInput = screen.getByPlaceholderText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    expect(screen.getByText(/Password Strength: Very Weak/i)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
    expect(screen.getByText(/Password Strength: Very Strong/i)).toBeInTheDocument();
  });

  // --- Product Interaction Tests ---
  test('adds product to cart successfully', async () => {
    // Mock login first
    axios.post.mockResolvedValueOnce({
      data: { session_id: 'user_session_123', role: 'user', user_email: 'user@example.com' },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => expect(screen.getByText(/Login successful!/i)).toBeInTheDocument());

    // Mock cart API calls
    axios.post.mockResolvedValueOnce({ data: { message: 'Item added to cart' } });
    axios.get.mockResolvedValueOnce({ data: { p1: 1 } }); // Cart contains 1x Shirt

    await waitFor(() => expect(screen.getByText(/Shirt/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Add to Cart/i)[0]); // Click add to cart for Shirt

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/cart`, {
        session_id: 'user_session_123',
        product_id: 'p1',
        quantity: 1,
      });
      expect(screen.getByText(/Shirt added to cart!/i)).toBeInTheDocument();
      expect(screen.getByText('🛒 1')).toBeInTheDocument(); // Cart count updates
    });
  });

  test('prevents adding to cart if not logged in', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Shirt/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Add to Cart/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/Please log in to add items to your cart./i)).toBeInTheDocument();
      expect(screen.getByText(/Login/i)).toBeInTheDocument(); // Login modal should appear
    });
    expect(axios.post).not.toHaveBeenCalled(); // No API call should be made
  });

  test('removes item from cart', async () => {
    // Mock login
    axios.post.mockResolvedValueOnce({
      data: { session_id: 'user_session_123', role: 'user', user_email: 'user@example.com' },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => expect(screen.getByText(/Login successful!/i)).toBeInTheDocument());

    // Add item to cart initially
    axios.post.mockResolvedValueOnce({ data: { message: 'Item added to cart' } });
    axios.get.mockResolvedValueOnce({ data: { p1: 1 } }); // Cart has 1x Shirt
    fireEvent.click(screen.getAllByText(/Add to Cart/i)[0]);
    await waitFor(() => expect(screen.getByText(/Shirt added to cart!/i)).toBeInTheDocument());

    // Open cart
    fireEvent.click(screen.getByText('🛒 1'));
    await waitFor(() => expect(screen.getByText(/Your Cart/i)).toBeInTheDocument());

    // Mock delete API call
    axios.delete.mockResolvedValueOnce({ data: { message: 'Item removed from cart' } });
    axios.get.mockResolvedValueOnce({ data: {} }); // Cart is empty after removal

    fireEvent.click(screen.getByRole('button', { name: '-' })); // Click remove button

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/api/cart`, {
        data: { session_id: 'user_session_123', product_id: 'p1' },
      });
      expect(screen.getByText(/Item removed from cart./i)).toBeInTheDocument();
      expect(screen.getByText(/No items in the cart./i)).toBeInTheDocument(); // Cart is empty
      expect(screen.getByText('🛒 0')).toBeInTheDocument(); // Cart count updates
    });
  });

  test('decrements item quantity in cart', async () => {
    // Mock login
    axios.post.mockResolvedValueOnce({
      data: { session_id: 'user_session_123', role: 'user', user_email: 'user@example.com' },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => expect(screen.getByText(/Login successful!/i)).toBeInTheDocument());

    // Add item to cart twice
    axios.post.mockResolvedValueOnce({ data: { message: 'Item added to cart' } });
    axios.get.mockResolvedValueOnce({ data: { p1: 1 } });
    fireEvent.click(screen.getAllByText(/Add to Cart/i)[0]);
    await waitFor(() => expect(screen.getByText(/Shirt added to cart!/i)).toBeInTheDocument());

    axios.post.mockResolvedValueOnce({ data: { message: 'Item added to cart' } });
    axios.get.mockResolvedValueOnce({ data: { p1: 2 } }); // Cart has 2x Shirt
    fireEvent.click(screen.getAllByText(/Add to Cart/i)[0]);
    await waitFor(() => expect(screen.getByText(/Shirt added to cart!/i)).toBeInTheDocument());

    // Open cart
    fireEvent.click(screen.getByText('🛒 2'));
    await waitFor(() => expect(screen.getByText(/Your Cart/i)).toBeInTheDocument());
    expect(screen.getByText('2')).toBeInTheDocument(); // Quantity is 2

    // Mock put API call
    axios.put.mockResolvedValueOnce({ data: { message: 'Item quantity decreased in cart' } });
    axios.get.mockResolvedValueOnce({ data: { p1: 1 } }); // Cart has 1x Shirt

    fireEvent.click(screen.getByRole('button', { name: '-' })); // Click remove button

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(`${API_URL}/api/cart`, {
        session_id: 'user_session_123',
        product_id: 'p1',
        quantity: 1,
      });
      expect(screen.getByText(/Item quantity decreased./i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Quantity is 1
    });
  });

  test('handles buy now successfully', async () => {
    // Mock login
    axios.post.mockResolvedValueOnce({
      data: { session_id: 'user_session_123', role: 'user', user_email: 'user@example.com' },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => expect(screen.getByText(/Login successful!/i)).toBeInTheDocument());

    await waitFor(() => expect(screen.getByText(/Shirt/i)).toBeInTheDocument());
    const initialStock = screen.getByText(/Stock: 10/i);
    expect(initialStock).toBeInTheDocument();

    fireEvent.click(screen.getAllByText(/Buy Now/i)[0]); // Click buy now for Shirt

    await waitFor(() => {
      expect(screen.getByText(/Successfully purchased 1x Shirt!/i)).toBeInTheDocument();
    });
    // Verify stock has decreased (frontend simulation)
    expect(screen.getByText(/Stock: 9/i)).toBeInTheDocument();
  });

  test('prevents buy now if not logged in', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Shirt/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Buy Now/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/Please log in to purchase items./i)).toBeInTheDocument();
      expect(screen.getByText(/Login/i)).toBeInTheDocument(); // Login modal should appear
    });
  });

  test('displays product details modal', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Shirt/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Shirt/i)); // Click on product name

    await waitFor(() => {
      expect(screen.getByText(/Shirt/i)).toBeInTheDocument(); // Product name in modal
      expect(screen.getByText(/Stock: 10/i)).toBeInTheDocument(); // Stock in modal
      expect(screen.getByText(/Size: M/i)).toBeInTheDocument(); // Size in modal
      expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Stock: 10/i)).not.toBeInTheDocument(); // Modal should close
    });
  });

  // --- Seller Functionality Tests ---
  test('allows seller to add a product', async () => {
    // Mock seller login
    axios.post.mockResolvedValueOnce({
      data: { session_id: 'seller_session_456', role: 'seller', user_email: 'seller@example.com' },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'seller@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'sellerpass' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => expect(screen.getByText(/Login successful!/i)).toBeInTheDocument());

    // Click add product button
    fireEvent.click(screen.getByText(/\+ Add Product/i));
    expect(screen.getByText(/Add Product/i)).toBeInTheDocument(); // Add product modal open

    // Mock add product API call
    axios.post.mockResolvedValueOnce({ data: { message: 'Product added successfully' } });
    // Mock subsequent product fetch after adding
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: 'p1', _displayId: 'dp1', name: 'Shirt', price: 25, category: 'men', stockAvailable: 10, image: 'shirt.jpg', size: 'M' },
        { _id: 'p2', _displayId: 'dp2', name: 'Dress', price: 50, category: 'women', stockAvailable: 5, image: 'dress.jpg', size: 'S' },
        { _id: 'p3', _displayId: 'dp3', name: 'New Jeans', price: 75, category: 'men', stockAvailable: 20, image: 'jeans.jpg', size: 'L' },
      ],
    });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Product Name/i), { target: { value: 'New Jeans' } });
    fireEvent.change(screen.getByPlaceholderText(/Price/i), { target: { value: '75' } });
    fireEvent.change(screen.getByPlaceholderText(/Image URL/i), { target: { value: 'jeans.jpg' } });
    fireEvent.change(screen.getByPlaceholderText(/Stock Available/i), { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText(/Size \(e.g., S, M, L\)/i), { target: { value: 'L' } });
    fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'Comfortable denim jeans' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Select Category/i }), { target: { value: 'men' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/addproducts`, {
        name: 'New Jeans',
        description: 'Comfortable denim jeans',
        price: 75,
        category: 'men',
        image: 'jeans.jpg',
        stockAvailable: 20,
        size: 'L',
        session_id: 'seller_session_456', // Ensure session_id is passed
      });
      expect(screen.getByText(/Product added successfully!/i)).toBeInTheDocument();
      expect(screen.queryByText(/Add Product/i)).not.toBeInTheDocument(); // Modal closes
      expect(screen.getByText(/New Jeans/i)).toBeInTheDocument(); // New product appears
    });
  });

  test('prevents seller from adding product with missing fields', async () => {
    // Mock seller login
    axios.post.mockResolvedValueOnce({
      data: { session_id: 'seller_session_456', role: 'seller', user_email: 'seller@example.com' },
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'seller@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'sellerpass' } });
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), { target: { value: 'TEST12' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => expect(screen.getByText(/Login successful!/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/\+ Add Product/i));
    expect(screen.getByText(/Add Product/i)).toBeInTheDocument();

    // Try to add with missing name
    fireEvent.change(screen.getByPlaceholderText(/Price/i), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText(/Stock Available/i), { target: { value: '10' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Select Category/i }), { target: { value: 'women' } });
    fireEvent.change(screen.getByPlaceholderText(/Size \(e.g., S, M, L\)/i), { target: { value: 'M' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields!/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalledWith(`${API_URL}/api/addproducts`, expect.any(Object)); // No API call
  });

  // --- Logout Test ---
  test('handles user logout', async () => {
    // Simulate being logged in
    localStorageMock.setItem('session_id', 'logged_in_session');
    localStorageMock.setItem('user_role', 'user');
    localStorageMock.setItem('user_email', 'logged@example.com');

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/logged@example.com \(user\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Sign Out/i));

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('session_id');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_role');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_email');
      expect(screen.getByText(/Logged out successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/Login \/ Register/i)).toBeInTheDocument(); // Login button reappears
    });
  });

  // --- Language Switching Test ---
  test('switches language correctly', async () => {
    render(<App />);
    expect(screen.getByText(/Modern Clothing Store/i)).toBeInTheDocument(); // Default English

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'hi' } });


    await waitFor(() => {
      expect(screen.getByText(/आधुनिक कपड़ों की दुकान/i)).toBeInTheDocument(); // Hindi translation
      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'hi');
    });

    fireEvent.change(screen.getByRole('combobox', { name: /Language Selector/i }), { target: { value: 'es' } });

    await waitFor(() => {
      expect(screen.getByText(/Tienda de Ropa Moderna/i)).toBeInTheDocument(); // Spanish translation
      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'es');
    });
  });

  // --- Pagination Tests ---
  test('handles pagination next and previous clicks', async () => {
    // Mock products for pagination
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/products')) {
        const page = new URLSearchParams(url.split('?')[1]).get('page');
        if (page === '1') {
          return Promise.resolve({
            data: Array.from({ length: 8 }, (_, i) => ({
              _id: `p${i + 1}`, _displayId: `dp${i + 1}`, name: `Product ${i + 1}`, price: 10, category: 'men', stockAvailable: 5, image: 'img.jpg', size: 'M'
            })),
          });
        } else if (page === '2') {
          return Promise.resolve({
            data: Array.from({ length: 2 }, (_, i) => ({
              _id: `p${i + 9}`, _displayId: `dp${i + 9}`, name: `Product ${i + 9}`, price: 10, category: 'men', stockAvailable: 5, image: 'img.jpg', size: 'M'
            })),
          });
        }
      }
      return Promise.resolve({ data: [] });
    });

    render(<App />);

    // Initial load, should show page 1
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument(); // Initially, totalPages might be 1 if only 8 products are mocked
      expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/Product 9/i)).not.toBeInTheDocument();
    });

    // Since the totalProductsCount is based on the fetched products, and we only mock 8,
    // the totalPages will be 1. To test pagination, we need to manually set totalProductsCount or mock more products.
    // For a more robust test, the backend mock should return total_count.
    // Given the current mock, let's simulate more products fetched initially to enable pagination.
    axios.get.mockResolvedValueOnce({
      data: Array.from({ length: 10 }, (_, i) => ({
        _id: `p${i + 1}`, _displayId: `dp${i + 1}`, name: `Product ${i + 1}`, price: 10, category: 'men', stockAvailable: 5, image: 'img.jpg', size: 'M'
      })),
    });
    // Re-render to pick up new mock for total products
    act(() => {
      render(<App />);
    });
    // Now totalPages should be 2 (10 products / 8 per page = 1.25 -> 2 pages)
    await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    });


    // Click next
    fireEvent.click(screen.getAllByRole('button', { name: /Next/i })[0]);
    await waitFor(() => {
      expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
      expect(screen.queryByText(/Product 1/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Product 9/i)).toBeInTheDocument();
    });

    // Click previous
    fireEvent.click(screen.getAllByRole('button', { name: /Previous/i })[0]);
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/Product 9/i)).not.toBeInTheDocument();
    });
  });

  // --- Settings Modal Test ---
  test('opens and closes settings modal', async () => {
    // Simulate logged in
    localStorageMock.setItem('session_id', 'user_session_123');
    localStorageMock.setItem('user_role', 'user');
    localStorageMock.setItem('user_email', 'user@example.com');
    render(<App />);

    await waitFor(() => expect(screen.getByText(/Settings/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Settings/i));

    await waitFor(() => {
      expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Email: user@example.com'))).toBeInTheDocument();
      expect(screen.getByText(/Role: user/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Account Settings/i)).not.toBeInTheDocument();
    });
  });
});
