import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock axios to prevent actual API calls during tests
jest.mock('axios');

// Mock localStorage for session management
const localStorageMock = (() => {
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

// Wrapper component to provide Router context
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Seller Registration', () => {
  const mockProducts = [
    { _id: 'p1', name: 'Classic Tee', price: 25, category: 'men', stockAvailable: 10, image: 'tee.jpg', size: 'M' },
    { _id: 'p2', name: 'Summer Dress', price: 50, category: 'women', stockAvailable: 5, image: 'dress.jpg', size: 'S' },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.setTimeout(8000);
    localStorageMock.clear();

    // Mock initial product fetch
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/products')) {
        return Promise.resolve({
          data: { products: mockProducts, total_count: mockProducts.length },
        });
      }
      if (url.includes('/api/cart')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('handles seller registration with address field', async () => {
    // Mock successful seller registration response
    axios.post.mockResolvedValueOnce({ 
      data: { message: 'Seller registered successfully' } 
    });

    renderWithRouter(<App />);
    
    // Click the login/register button to open the modal
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    
    // Wait for the modal to appear and click the register as seller button
    await waitFor(() => {
      const registerAsSellerButton = screen.getByText(/registerAsSeller/i);
      fireEvent.click(registerAsSellerButton);
    });

    // Wait for seller registration form to appear and fill in the fields
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/displayName/i)).toBeInTheDocument();
    });

    // Fill in seller details
    fireEvent.change(screen.getByPlaceholderText(/displayName/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/phone/i), { 
      target: { value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/gstNumber/i), { 
      target: { value: 'GST123456789' } 
    });
    
    // Fill in the address field (this is the important part we want to test)
    fireEvent.change(screen.getByPlaceholderText(/address/i), { 
      target: { value: '123 Main Street, New York, NY 10001' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { 
      target: { value: 'seller@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { 
      target: { value: 'password123' } 
    });

    // Get the CAPTCHA value from the displayed CAPTCHA text (using a more specific selector for the CAPTCHA code span)
    const dialog = await screen.findByRole('dialog');
    const captchaElement = within(dialog).getByText(/^[A-Z2-9]{6}$/);
    const captchaValue = captchaElement.textContent;
    fireEvent.change(screen.getByPlaceholderText(/Enter CAPTCHA/i), { 
      target: { value: captchaValue } 
    });

    // Click the register button
    fireEvent.click(screen.getByRole('button', { name: /registerAsSeller/i }));

    // Wait for the API call to happen
    await waitFor(() => {
      // Check that the selleregister API was called with the correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/selleregister'),
        expect.objectContaining({
          email: 'seller@example.com',
          password: 'password123',
          SellerName: 'John Doe',
          SellerPhone: '1234567890',
          SellerGSTNumber: 'GST123456789',
          SellerAddress: '123 Main Street, New York, NY 10001', // This confirms our fix works
        })
      );
      
      // Check that success message is displayed (the actual message is "Please login." not "Please log in.")
      expect(screen.getByText(/Seller registered successfully! Please login./i)).toBeInTheDocument();
    });
  });

  test('handles seller registration with whitespace-only address (should show error)', async () => {
    renderWithRouter(<App />);
    
    // Click the login/register button to open the modal
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    
    // Wait for the modal to appear and click the register as seller button
    await waitFor(() => {
      const registerAsSellerButton = screen.getByText(/registerAsSeller/i);
      fireEvent.click(registerAsSellerButton);
    });

    // Wait for seller registration form to appear and fill in the fields
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/displayName/i)).toBeInTheDocument();
    });

    // Fill in seller details but use only whitespace for address
    fireEvent.change(screen.getByPlaceholderText(/displayName/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/phone/i), { 
      target: { value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/gstNumber/i), { 
      target: { value: 'GST123456789' } 
    });
    
    // Fill in the address field with only spaces (should trigger our validation)
    fireEvent.change(screen.getByPlaceholderText(/address/i), { 
      target: { value: '   ' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { 
      target: { value: 'seller@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { 
      target: { value: 'password123' } 
    });

    // Get the CAPTCHA value from the displayed CAPTCHA text (using a more specific selector for the CAPTCHA code span)
    const dialog = await screen.findByRole('dialog');
    const captchaElement = within(dialog).getByText(/^[A-Z2-9]{6}$/);
    const captchaValue = captchaElement.textContent;
    fireEvent.change(screen.getByPlaceholderText(/Enter CAPTCHA/i), { 
      target: { value: captchaValue } 
    });

    // Click the register button
    fireEvent.click(screen.getByRole('button', { name: /registerAsSeller/i }));

    // Wait for the validation error to appear (should happen immediately)
    await waitFor(() => {
      // Check that our validation error message appears in the popup
      expect(screen.getByText(/Address is required/i)).toBeInTheDocument();
      
      // Ensure that the API was NOT called (because of our validation)
      expect(axios.post).not.toHaveBeenCalled();
    }, { timeout: 8000 }); // Add a timeout to ensure the popup appears
  });

  test('handles seller registration with empty address (should show error)', async () => {
    renderWithRouter(<App />);
    
    // Click the login/register button to open the modal
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    
    // Wait for the modal to appear and click the register as seller button
    await waitFor(() => {
      const registerAsSellerButton = screen.getByText(/registerAsSeller/i);
      fireEvent.click(registerAsSellerButton);
    });

    // Wait for seller registration form to appear and fill in the fields
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/displayName/i)).toBeInTheDocument();
    });

    // Fill in seller details but leave address empty
    fireEvent.change(screen.getByPlaceholderText(/displayName/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/phone/i), { 
      target: { value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/gstNumber/i), { 
      target: { value: 'GST123456789' } 
    });
    // Don't fill in the address field - it remains empty
    
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { 
      target: { value: 'seller@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { 
      target: { value: 'password123' } 
    });

    // Get the CAPTCHA value from the displayed CAPTCHA text (using a more specific selector for the CAPTCHA code span)
    const dialog = await screen.findByRole('dialog');
    const captchaElement = within(dialog).getByText(/^[A-Z2-9]{6}$/);
    const captchaValue = captchaElement.textContent;
    fireEvent.change(screen.getByPlaceholderText(/Enter CAPTCHA/i), { 
      target: { value: captchaValue } 
    });

    // Click the register button
    fireEvent.click(screen.getByRole('button', { name: /registerAsSeller/i }));

    // Wait for the validation error to appear (should happen immediately)
    await waitFor(() => {
      // The error message appears in the popup notification at the top right
      const errorMessage = screen.getByText(/Address is required/i);
      expect(errorMessage).toBeInTheDocument();
      
      // Ensure that the API was NOT called (because of our validation)
      expect(axios.post).not.toHaveBeenCalled();
    }, { timeout: 8000 }); // Increase timeout to ensure the popup appears
  });

  test('handles successful seller registration with address containing spaces', async () => {
    // Mock successful seller registration response
    axios.post.mockResolvedValueOnce({ 
      data: { message: 'Seller registered successfully' } 
    });

    renderWithRouter(<App />);
    
    // Click the login/register button to open the modal
    fireEvent.click(screen.getByText(/Login \/ Register/i));
    
    // Wait for the modal to appear and click the register as seller button
    await waitFor(() => {
      const registerAsSellerButton = screen.getByText(/registerAsSeller/i);
      fireEvent.click(registerAsSellerButton);
    });

    // Wait for seller registration form to appear and fill in the fields
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/displayName/i)).toBeInTheDocument();
    });

    // Fill in seller details
    fireEvent.change(screen.getByPlaceholderText(/displayName/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/phone/i), { 
      target: { value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/gstNumber/i), { 
      target: { value: 'GST123456789' } 
    });
    
    // Fill in the address field with multiple words and spaces (should work properly)
    fireEvent.change(screen.getByPlaceholderText(/address/i), { 
      target: { value: '123 Oak Street Apt 4B' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { 
      target: { value: 'seller@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { 
      target: { value: 'password123' } 
    });

    // Get the CAPTCHA value from the displayed CAPTCHA text (using a more specific selector for the CAPTCHA code span)
    const dialog = await screen.findByRole('dialog');
    const captchaElement = within(dialog).getByText(/^[A-Z2-9]{6}$/);
    const captchaValue = captchaElement.textContent;
    fireEvent.change(screen.getByPlaceholderText(/Enter CAPTCHA/i), { 
      target: { value: captchaValue } 
    });

    // Click the register button
    fireEvent.click(screen.getByRole('button', { name: /registerAsSeller/i }));

    // Wait for the API call to happen, ensuring the address was sent properly (with trimmed spaces)
    await waitFor(() => {
      // Check that the selleregister API was called with the correct parameters
      // Our fix should have properly trimmed the address
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/selleregister'),
        expect.objectContaining({
          email: 'seller@example.com',
          password: 'password123',
          SellerName: 'John Doe',
          SellerPhone: '1234567890',
          SellerGSTNumber: 'GST123456789',
          SellerAddress: '123 Oak Street Apt 4B', // Should match exactly what was entered
        })
      );
    });
  });
});