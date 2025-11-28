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

describe('App Component', () => {
  const mockProducts = [
    { _id: 'p1', name: 'Classic Tee', price: 25, category: 'men', stockAvailable: 10, image: 'tee.jpg', size: 'M' },
    { _id: 'p2', name: 'Summer Dress', price: 50, category: 'women', stockAvailable: 5, image: 'dress.jpg', size: 'S' },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
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

  test('renders the store name and loads products on initial render', async () => {
    renderWithRouter(<App />);
    expect(screen.getAllByText(/Modern Clothing Store/i)[0]).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Classic Tee')).toBeInTheDocument();
      expect(screen.getByText('Summer Dress')).toBeInTheDocument();
    });
  });

  test('shows a loading skeleton while products are being fetched', async () => {
    // Make axios promise never resolve to keep it in loading state
    axios.get.mockImplementation(() => new Promise(() => {}));
    const { container } = renderWithRouter(<App />);
    // The skeleton is identified by its animation class
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    await waitFor(() => {
        expect(screen.queryByText('Classic Tee')).not.toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    test('opens login modal when "Login / Register" is clicked', async () => {
      renderWithRouter(<App />);
      fireEvent.click(screen.getByText(/Login \/ Register/i));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
      });
    });

    test('handles successful user login', async () => {
      axios.post.mockResolvedValueOnce({
        data: { session_id: 'user_session_123', role: 'user', user_email: 'user@example.com' },
      });

      renderWithRouter(<App />);
      fireEvent.click(screen.getByText(/Login \/ Register/i));

      await waitFor(() => screen.getByPlaceholderText(/Email/i));
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      
      // Find the CAPTCHA code by looking inside the dialog for the specific CAPTCHA span
      const dialog = await screen.findByRole('dialog');
      const captchaElements = within(dialog).getAllByText(/[A-Z0-9]{6}/);
      // Get the CAPTCHA code from the element that matches the styling used in the component
      const captcha = captchaElements.find(el => 
        el.className && 
        el.className.includes('text-xl') && 
        el.className.includes('font-bold') && 
        el.className.includes('select-none')
      );
      fireEvent.change(screen.getByPlaceholderText(/Enter CAPTCHA/i), { target: { value: captcha.textContent } });
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/login'), {
          email: 'user@example.com',
          password: 'password123',
        });
        expect(localStorage.setItem).toHaveBeenCalledWith('session_id', 'user_session_123');
        expect(screen.getByText(/Login successful!/i)).toBeInTheDocument();
        expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
      });
    });

    test('handles failed login with an error message', async () => {
      axios.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } });
      renderWithRouter(<App />);
      fireEvent.click(screen.getByText(/Login \/ Register/i));

      await waitFor(() => screen.getByPlaceholderText(/Email/i));
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpassword' } });
      
      // Find the CAPTCHA code by looking inside the dialog for the specific CAPTCHA span
      const dialog = await screen.findByRole('dialog');
      const captchaElements = within(dialog).getAllByText(/[A-Z0-9]{6}/);
      // Get the CAPTCHA code from the element that matches the styling used in the component
      const captcha = captchaElements.find(el => 
        el.className && 
        el.className.includes('text-xl') && 
        el.className.includes('font-bold') && 
        el.className.includes('select-none')
      );
      fireEvent.change(screen.getByPlaceholderText(/Enter CAPTCHA/i), { target: { value: captcha.textContent } });
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });

    test('handles user registration', async () => {
        axios.post.mockResolvedValueOnce({ data: { message: 'User registered successfully' } });
        renderWithRouter(<App />);
        fireEvent.click(screen.getByText(/Login \/ Register/i));
        
        const registerButton = await screen.findByTestId('register-here-button');
        fireEvent.click(registerButton);
        
        await waitFor(() => screen.getByRole('button', { name: /^Register$/i }));
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'newuser@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'newpassword123' } });
        
        // Find the CAPTCHA code by looking inside the dialog for the specific CAPTCHA span
        const dialog = await screen.findByRole('dialog');
        const captchaElements = within(dialog).getAllByText(/[A-Z0-9]{6}/);
        // Get the CAPTCHA code from the element that matches the styling used in the component
        const captcha = captchaElements.find(el => 
          el.className && 
          el.className.includes('text-xl') && 
          el.className.includes('font-bold') && 
          el.className.includes('select-none')
        );
        fireEvent.change(screen.getByPlaceholderText(/Enter CAPTCHA/i), { target: { value: captcha.textContent } });
        fireEvent.click(screen.getByRole('button', { name: /^Register$/i }));

        
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/register'), {
                email: 'newuser@example.com',
                password: 'newpassword123',
            });
            expect(screen.getByText(/Registered successfully! Please log in./i)).toBeInTheDocument();
        });
    });

    test('handles user logout', async () => {
      // Simulate being logged in
      localStorage.setItem('session_id', 'user_session_123');
      localStorage.setItem('user_role', 'user');
      renderWithRouter(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Sign Out/i));

      await waitFor(() => {
        expect(localStorage.clear).toHaveBeenCalled();
        expect(screen.getByText(/Logged out successfully!/i)).toBeInTheDocument();
        expect(screen.getByText(/Login \/ Register/i)).toBeInTheDocument();
      });
    });
  });

  describe('Shopping Cart', () => {
    beforeEach(() => {
      // Log in the user for cart tests
      localStorage.setItem('session_id', 'user_session_123');
      localStorage.setItem('user_role', 'user');
    });

    test('adds a product to the cart', async () => {
      axios.post.mockResolvedValue({ data: { message: 'Item added' } });
      // Mock fetchCart to return the added item
      axios.get.mockImplementation(url => {
        if (url.includes('/api/cart')) {
          return Promise.resolve({ data: { p1: 1 } });
        }
        if (url.includes('/api/products')) {
          return Promise.resolve({ data: { products: mockProducts } });
        }
        return Promise.resolve({ data: {} });
      });

      renderWithRouter(<App />);
      await waitFor(() => expect(screen.getByText('Classic Tee')).toBeInTheDocument());

      const addToCartButton = screen.getAllByLabelText(/Add .* to cart/i)[0];
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/cart'), {
          session_id: 'user_session_123',
          product_id: 'p1',
          quantity: 1,
        });
      });
      await screen.findByText(/Classic Tee added to cart!/i);
      // Check for cart icon with count 1
      const header = screen.getByRole('banner');
      expect(within(header).getByText('1')).toBeInTheDocument();
    });

    test('removes a product from the cart', async () => {
        // Setup: Item is already in the cart
        axios.get.mockImplementation(url => {
            if (url.includes('/api/cart')) {
              return Promise.resolve({ data: { p1: 1 } });
            }
            if (url.includes('/api/products')) {
              return Promise.resolve({ data: { products: mockProducts } });
            }
            return Promise.resolve({ data: {} });
        });
        axios.delete.mockResolvedValue({ data: { message: 'Item removed' } });
  
        renderWithRouter(<App />);
  
        // Wait for cart to be populated
        await waitFor(() => expect(within(screen.getByRole('banner')).getByText('1')).toBeInTheDocument());
  
        // Open the cart drawer - target the header cart button specifically
        // The header contains the main cart button we need
        const header = screen.getByRole('banner');
        const cartButton = within(header).getByLabelText(/cart/i);
        fireEvent.click(cartButton);
  
        // Wait for cart items to appear
        const cartDrawer = await screen.findByRole('heading', { name: /Your Cart/i });
        const cartDialog = cartDrawer.closest('div.fixed');
        await waitFor(() => expect(within(cartDialog).getByText('Classic Tee')).toBeInTheDocument());
  
        // Click the remove button for the item - use the aria-label
        fireEvent.click(within(cartDialog).getByRole('button', { name: /Remove/ }));
  
        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/cart'), {
                data: { session_id: 'user_session_123', product_id: 'p1' }
            });
            expect(screen.getByText(/Item removed from cart/i)).toBeInTheDocument();
        });
    });
  });

  describe('Seller Functionality', () => {
    beforeEach(() => {
      // Log in as a seller
      localStorage.setItem('session_id', 'seller_session_456');
      localStorage.setItem('user_role', 'seller');
    });

    test('allows a seller to add a new product', async () => {
      const newProduct = { name: 'New Jeans', price: 80, category: 'men', stockAvailable: 50, size: 'L' };
      axios.post.mockResolvedValue({ data: { message: 'Product added' } });
      
      renderWithRouter(<App />);

      await waitFor(() => expect(screen.getByText(/\+ Add Product/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText(/\+ Add Product/i));

      const dialog = await screen.findByRole('dialog');

      fireEvent.change(within(dialog).getByPlaceholderText('productName'), { target: { value: newProduct.name } });
      fireEvent.change(within(dialog).getByPlaceholderText('price'), { target: { value: newProduct.price } });
      fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: newProduct.category } });
      fireEvent.change(within(dialog).getByPlaceholderText('stockAvailable'), { target: { value: newProduct.stockAvailable } });
      fireEvent.change(within(dialog).getByPlaceholderText('size'), { target: { value: newProduct.size } });

      fireEvent.click(within(dialog).getByRole('button', { name: /Add Product/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/addproducts'), expect.objectContaining({
            ...newProduct,
            session_id: 'seller_session_456'
        }));
        expect(screen.getByText(/Product added successfully!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Language and Currency', () => {
    test('switches language and updates UI text', async () => {
      renderWithRouter(<App />);
      await waitFor(() => expect(screen.getAllByText(/Modern Clothing Store/i)[0]).toBeInTheDocument());

      // Switch to English (already default, but good for checking)
      const languageSelect = screen.getByLabelText(/Select language/i);
      fireEvent.change(languageSelect, { target: { value: 'en' } });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /🛍️ Modern Clothing Store/i })).toBeInTheDocument();
        expect(localStorage.setItem).toHaveBeenCalledWith('language', 'en');
      });
    });

    test('switches currency and updates price display', async () => {
        renderWithRouter(<App />);
        await waitFor(() => expect(screen.getByText('Classic Tee')).toBeInTheDocument());
    
        // Default currency is INR (₹)
        expect(screen.getByText((content, element) => content.startsWith('₹') && content.includes('2087.50'))).toBeInTheDocument();
    
        // Switch to USD
        const currencySelect = screen.getByLabelText(/Select currency/i);
        fireEvent.change(currencySelect, { target: { value: 'USD' } });
    
        await waitFor(() => {
          expect(screen.getByText((content, element) => content.startsWith('$') && content.includes('25.00'))).toBeInTheDocument();
          expect(localStorage.setItem).toHaveBeenCalledWith('currency', 'USD');
        });
    
        // Switch to EUR
        fireEvent.change(currencySelect, { target: { value: 'EUR' } });
    
        await waitFor(() => {
          expect(screen.getByText((content, element) => content.startsWith('€') && content.includes('23.25'))).toBeInTheDocument(); // 25 * 0.93
          expect(localStorage.setItem).toHaveBeenCalledWith('currency', 'EUR');
        });
      });
  });
});