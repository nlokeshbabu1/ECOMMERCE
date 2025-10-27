import pytest
import json
from unittest.mock import patch, MagicMock
from bson.objectid import ObjectId

# Global variables to store the mocked app and dependencies
test_app = None
mocks = None


@pytest.fixture(scope="session", autouse=True)
def setup_test_app():
    """Setup the test app with all necessary mocks."""
    global test_app, mocks
    
    # Create all necessary mocks
    with patch('pymongo.MongoClient') as mock_mongo, \
         patch('redis.Redis') as mock_redis, \
         patch('flask_bcrypt.Bcrypt') as mock_bcrypt:
        
        # Create mock instances
        mock_mongo_instance = MagicMock()
        mock_mongo.return_value = mock_mongo_instance
        mock_mongo_db = MagicMock()
        mock_mongo_instance.__getitem__.return_value = mock_mongo_db
        
        # Configure collections
        mock_products_collection = MagicMock()
        mock_users_collection = MagicMock()
        mock_orders_collection = MagicMock()
        
        def get_collection(name):
            if name == 'products':
                return mock_products_collection
            elif name == 'users':
                return mock_users_collection
            elif name == 'orders':
                return mock_orders_collection
            else:
                return MagicMock()
        
        mock_mongo_db.__getitem__.side_effect = get_collection
        
        mock_redis_instance = MagicMock()
        mock_redis.return_value = mock_redis_instance
        
        mock_bcrypt_instance = MagicMock()
        mock_bcrypt.return_value = mock_bcrypt_instance
        mock_bcrypt_instance.generate_password_hash.return_value = b'test_hash'
        mock_bcrypt_instance.check_password_hash.return_value = True
        
        # Store the mocks
        mocks = {
            'mongo_client': mock_mongo,
            'mongo_instance': mock_mongo_instance,
            'mongo_db': mock_mongo_db,
            'products_collection': mock_products_collection,
            'users_collection': mock_users_collection,
            'orders_collection': mock_orders_collection,
            'redis_client': mock_redis_instance,
            'bcrypt': mock_bcrypt_instance
        }
        
        # Import the app after setting up all mocks
        import app  # This is now safe to import
        test_app = app.app
        test_app.config['TESTING'] = True
        
        yield


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    global test_app, mocks
    with test_app.test_client() as client:
        yield client, mocks


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        'email': 'test@example.com',
        'password': 'password123',
        'name': 'Test User'
    }


@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        'name': 'Test Product',
        'price': 29.99,
        'category': 'clothing',
        'stockAvailable': 10,
        'description': 'Test product description'
    }


@pytest.fixture
def sample_session_id():
    """Sample session ID for testing."""
    return 'test-session-id-12345'


# Basic health check test
def test_health_check(client):
    """Test the health check endpoint."""
    client_instance, mocks = client
    response = client_instance.get('/healthz')
    assert response.status_code == 200
    assert response.data == b'OK'


# Test user registration
def test_register_user_success(client, sample_user_data):
    """Test successful user registration."""
    client_instance, mocks = client
    
    # Configure the mock to return None for find_one (user doesn't exist)
    mocks['users_collection'].find_one.return_value = None
    
    # Set up return value for insert_one
    insert_result = MagicMock()
    mocks['users_collection'].insert_one.return_value = insert_result
    
    # Prepare registration data
    user_data = {
        'email': 'newuser@example.com',
        'password': 'password123'
    }
    
    # Send POST request to register endpoint
    response = client_instance.post('/api/register', 
                                   data=json.dumps(user_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'User registered successfully'
    
    # Verify that find_one was called to check if user exists
    mocks['users_collection'].find_one.assert_called_once_with({'email': user_data['email']})
    
    # Verify that insert_one was called
    assert mocks['users_collection'].insert_one.called


def test_register_user_already_exists(client, sample_user_data):
    """Test user registration with existing user."""
    client_instance, mocks = client
    
    # Configure the mock to return a user (user exists)
    mocks['users_collection'].find_one.return_value = {'email': 'existing@example.com'}
    
    # Prepare registration data
    user_data = {
        'email': 'existing@example.com',
        'password': 'password123'
    }
    
    # Send POST request to register endpoint
    response = client_instance.post('/api/register',
                                   data=json.dumps(user_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 409
    data = json.loads(response.data)
    assert data['error'] == 'User already exists'


def test_register_user_invalid_email(client, sample_user_data):
    """Test user registration with invalid email."""
    client_instance, mocks = client
    
    # Configure the mock to return None for find_one (user doesn't exist)
    mocks['users_collection'].find_one.return_value = None
    
    # Prepare registration data with invalid email
    user_data = {
        'email': 'invalid-email',
        'password': 'password123'
    }
    
    # Send POST request to register endpoint
    response = client_instance.post('/api/register',
                                   data=json.dumps(user_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['error'] == 'Invalid mail_id'


def test_login_success(client, sample_user_data):
    """Test successful user login."""
    client_instance, mocks = client
    
    # Configure the mock to return a user
    user = {
        '_id': ObjectId(),
        'email': 'test@example.com',
        'password': 'hashed_password',
        'role': 'user'
    }
    mocks['users_collection'].find_one.return_value = user
    
    # Prepare login data
    login_data = {
        'email': 'test@example.com',
        'password': 'password123'
    }
    
    # Mock Redis to store session
    mock_redis = mocks['redis_client']
    mock_redis.set.return_value = True
    mock_redis.expire.return_value = True
    
    # Send POST request to login endpoint
    response = client_instance.post('/api/login',
                                   data=json.dumps(login_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'session_id' in data
    assert data['role'] == 'user'
    assert data['user_email'] == 'test@example.com'


def test_login_invalid_credentials(client, sample_user_data):
    """Test login with invalid credentials."""
    client_instance, mocks = client
    
    # Configure the mock to return a user
    user = {
        '_id': ObjectId(),
        'email': 'test@example.com',
        'password': 'hashed_password'
    }
    mocks['users_collection'].find_one.return_value = user
    
    # Mock bcrypt to return False for invalid password
    original_bcrypt = mocks['bcrypt']
    original_bcrypt.check_password_hash.return_value = False
    
    # Prepare login data
    login_data = {
        'email': 'test@example.com',
        'password': 'wrong_password'
    }
    
    # Send POST request to login endpoint
    response = client_instance.post('/api/login',
                                   data=json.dumps(login_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['error'] == 'Invalid credentials'


# Test product management
def test_get_products(client):
    """Test getting products."""
    client_instance, mocks = client
    
    # Create a mock cursor with skip and limit methods
    mock_cursor = MagicMock()
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = mock_cursor
    mock_cursor.__iter__.return_value = iter([
        {
            '_id': ObjectId(),
            'name': 'Test Product',
            'price': 29.99,
            'category': 'clothing',
            'stockavailable': 10
        }
    ])
    
    # Configure the mocks
    mocks['products_collection'].find.return_value = mock_cursor
    mocks['products_collection'].count_documents.return_value = 1
    
    # Send GET request to products endpoint
    response = client_instance.get('/api/products')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'products' in data
    assert len(data['products']) == 1
    assert data['products'][0]['name'] == 'Test Product'


def test_add_product_success(client, sample_session_id):
    """Test adding a product successfully."""
    client_instance, mocks = client
    
    # Configure mock for session/user verification
    with patch('app.get_user_email_from_session', return_value='seller@example.com'):
        # Prepare product data
        product_data = {
            'session_id': sample_session_id,
            'name': 'New Product',
            'price': 49.99,
            'category': 'electronics',
            'stockAvailable': 5,
            'description': 'A new product'
        }
        
        # Send POST request to add product endpoint
        response = client_instance.post('/api/addproducts',
                                       data=json.dumps(product_data),
                                       content_type='application/json')
    
    # Verify response
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'Product added successfully'
    
    # Verify that insert_one was called
    assert mocks['products_collection'].insert_one.called


def test_add_product_unauthorized(client, sample_session_id):
    """Test adding a product without proper authorization."""
    client_instance, mocks = client
    
    # Configure mock for session/user verification to return None (not authorized)
    with patch('app.get_user_email_from_session', return_value=None):
        # Prepare product data
        product_data = {
            'session_id': sample_session_id,
            'name': 'New Product',
            'price': 49.99,
            'category': 'electronics',
            'stockAvailable': 5
        }
        
        # Send POST request to add product endpoint
        response = client_instance.post('/api/addproducts',
                                       data=json.dumps(product_data),
                                       content_type='application/json')
    
    # Verify response
    assert response.status_code == 403
    data = json.loads(response.data)
    assert data['error'] == 'Unauthorized: Invalid session or not logged in as seller'


# Test shopping cart functionality
def test_add_to_cart_success(client, sample_session_id):
    """Test adding an item to the cart."""
    client_instance, mocks = client
    
    # Prepare cart data
    cart_data = {
        'session_id': sample_session_id,
        'product_id': str(ObjectId()),
        'quantity': 2
    }
    
    # Mock Redis behavior
    mock_redis = mocks['redis_client']
    mock_redis.hincrby.return_value = 2
    mock_redis.expire.return_value = True
    
    # Send POST request to add to cart endpoint
    response = client_instance.post('/api/cart',
                                   data=json.dumps(cart_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Item added to cart'


def test_get_cart_success(client, sample_session_id):
    """Test getting items from the cart."""
    client_instance, mocks = client
    
    # Mock Redis behavior
    mock_redis = mocks['redis_client']
    cart_contents = {'product123': '2', 'product456': '1'}
    mock_redis.hgetall.return_value = cart_contents
    
    # Send GET request to get cart endpoint
    response = client_instance.get(f'/api/cart/{sample_session_id}')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'product123' in data
    assert data['product123'] == 2


# Test order management
def test_create_order_success(client, sample_session_id):
    """Test creating an order successfully."""
    client_instance, mocks = client
    
    # Mock the necessary functions and data
    user = {
        '_id': ObjectId(),
        'email': 'test@example.com'
    }
    product = {
        '_id': ObjectId(),
        'name': 'Test Product',
        'price': 29.99,
        'stockavailable': 10
    }
    
    # Set up mocks
    mocks['users_collection'].find_one.return_value = user
    mocks['products_collection'].find_one.return_value = product
    
    mock_redis = mocks['redis_client']
    # Set up Redis to return user ID when session is checked
    mock_redis.get.return_value = str(user['_id'])
    mock_redis.hgetall.return_value = {str(product['_id']): '2'}
    mock_redis.delete.return_value = 1
    
    # Mock ObjectId conversion
    with patch('app.ObjectId', ObjectId):
        # Prepare order data
        order_data = {
            'session_id': sample_session_id,
            'shipping_address': '123 Test St',
            'payment_method': 'cod'
        }
        
        # Mock insert result
        insert_result = MagicMock()
        insert_result.inserted_id = ObjectId()
        mocks['orders_collection'].insert_one.return_value = insert_result
        
        # Send POST request to create order endpoint
        response = client_instance.post('/api/orders',
                                       data=json.dumps(order_data),
                                       content_type='application/json')
    
    # Verify response
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'Order created successfully'
    assert 'order_id' in data


# Test seller registration
def test_seller_register_success(client):
    """Test successful seller registration."""
    client_instance, mocks = client
    
    # Configure the mock to return None for find_one (seller doesn't exist)
    mocks['users_collection'].find_one.return_value = None
    
    # Set up return value for insert_one
    insert_result = MagicMock()
    mocks['users_collection'].insert_one.return_value = insert_result
    
    # Prepare seller registration data
    seller_data = {
        'email': 'new.seller@example.com',
        'password': 'password123',
        'SellerName': 'New Seller',
        'SellerPhone': '1234567890',
        'SellerGSTNumber': 'GST123456',
        'SellerAddres': '123 Seller St'
    }
    
    # Send POST request to seller register endpoint
    response = client_instance.post('/api/selleregister',
                                   data=json.dumps(seller_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'Seller registered successfully'
    
    # Verify that insert_one was called with the correct role
    call_args = mocks['users_collection'].insert_one.call_args[0][0]
    assert call_args['role'] == 'seller'


def test_delete_account_success(client, sample_session_id):
    """Test successful account deletion."""
    client_instance, mocks = client
    
    # Mock user data
    user = {
        '_id': ObjectId(),
        'email': 'test@example.com'
    }
    
    # Set up mocks
    mock_redis = mocks['redis_client']
    mock_redis.get.return_value = str(user['_id'])
    mock_redis.delete.return_value = 1
    
    # Mock the user collection
    mocks['users_collection'].find_one.return_value = user
    delete_result = MagicMock()
    delete_result.deleted_count = 1
    mocks['users_collection'].delete_one.return_value = delete_result
    
    # Prepare deletion data
    delete_data = {'session_id': sample_session_id}
    
    # Send DELETE request to delete account endpoint
    response = client_instance.delete('/api/user',
                                     data=json.dumps(delete_data),
                                     content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Account deleted successfully'


# Test forgot password functionality
def test_forgot_password_user_exists(client):
    """Test forgot password with existing user."""
    client_instance, mocks = client
    
    # Mock user data
    user = {
        '_id': ObjectId(),
        'email': 'test@example.com'
    }
    
    # Set up mock
    mocks['users_collection'].find_one.return_value = user
    update_result = MagicMock()
    mocks['users_collection'].update_one.return_value = update_result
    
    # Prepare request data
    data = {'email': 'test@example.com'}
    
    # Send POST request to forgot password endpoint
    response = client_instance.post('/api/auth/forgot-password',
                                   data=json.dumps(data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    result = json.loads(response.data)
    assert result['message'] == 'If your email is registered, you will receive a password reset link shortly.'


def test_forgot_password_user_not_exists(client):
    """Test forgot password with non-existing user."""
    client_instance, mocks = client
    
    # Set up mock to return None (user doesn't exist)
    mocks['users_collection'].find_one.return_value = None
    
    # Prepare request data
    data = {'email': 'nonexistent@example.com'}
    
    # Send POST request to forgot password endpoint
    response = client_instance.post('/api/auth/forgot-password',
                                   data=json.dumps(data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    result = json.loads(response.data)
    assert result['message'] == 'If your email is registered, you will receive a password reset link shortly.'


# Test reset password functionality
def test_reset_password_success(client):
    """Test successful password reset."""
    client_instance, mocks = client
    
    # Mock user data with reset token
    user = {
        '_id': ObjectId(),
        'email': 'test@example.com',
        'reset_token': 'test-token',
        'reset_token_expiry': None
    }
    
    # Set up mocks
    mocks['users_collection'].find_one.return_value = user
    update_result = MagicMock()
    mocks['users_collection'].update_one.return_value = update_result
    
    # Prepare reset data
    reset_data = {
        'token': 'test-token',
        'password': 'newpassword123'
    }
    
    # Send POST request to reset password endpoint
    response = client_instance.post('/api/auth/reset-password',
                                   data=json.dumps(reset_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    result = json.loads(response.data)
    assert result['message'] == 'Password reset successfully'


def test_reset_password_invalid_token(client):
    """Test password reset with invalid token."""
    client_instance, mocks = client
    
    # Set up mock to return None (no user with this token)
    mocks['users_collection'].find_one.return_value = None
    
    # Prepare reset data
    reset_data = {
        'token': 'invalid-token',
        'password': 'newpassword123'
    }
    
    # Send POST request to reset password endpoint
    response = client_instance.post('/api/auth/reset-password',
                                   data=json.dumps(reset_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 400
    result = json.loads(response.data)
    assert result['error'] == 'Invalid or expired reset token'


# Test product recommendations
def test_get_product_recommendations(client):
    """Test getting product recommendations."""
    client_instance, mocks = client
    
    # Create a mock cursor that works for the recommendations endpoint
    mock_cursor = MagicMock()
    mock_cursor.limit.return_value = mock_cursor
    mock_cursor.__iter__.return_value = iter([])
    
    # Mock a product
    product = {
        '_id': ObjectId(),
        'name': 'Test Product',
        'category': 'electronics',
        'stockavailable': 10
    }
    
    mocks['products_collection'].find_one.return_value = product
    mocks['products_collection'].find.return_value = mock_cursor
    
    product_id = str(product['_id'])
    
    # Send GET request to recommendations endpoint
    response = client_instance.get(f'/api/products/{product_id}/recommendations')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'recommendations' in data
    assert data['product_name'] == 'Test Product'


def test_get_user_recommendations(client, sample_session_id):
    """Test getting user-specific product recommendations."""
    client_instance, mocks = client
    
    # Create mock cursors that work with sort, limit methods
    mock_cursor = MagicMock()
    mock_cursor.sort.return_value = mock_cursor
    mock_cursor.limit.return_value = mock_cursor
    mock_cursor.__iter__.return_value = iter([])
    
    # Mock products
    product = {
        '_id': ObjectId(),
        'name': 'Test Product',
        'category': 'electronics',
        'stockavailable': 10
    }
    
    mocks['products_collection'].find.return_value = mock_cursor
    mocks['orders_collection'].find.return_value = []
    
    # Send GET request to user recommendations endpoint with session ID
    response = client_instance.get(f'/api/products/recommendations?session_id={sample_session_id}')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'recommendations' in data


# Test chatbot functionality
def test_chatbot_general_message(client):
    """Test chatbot with a general message."""
    client_instance, mocks = client
    
    # Prepare chat data
    chat_data = {
        'message': 'Hello, how are you?',
        'session_id': None  # No session ID for general message
    }
    
    # Send POST request to chat endpoint
    response = client_instance.post('/api/chat',
                                   data=json.dumps(chat_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'reply' in data
    assert isinstance(data['reply'], str)
    assert len(data['reply']) > 0


def test_chatbot_with_session(client, sample_session_id):
    """Test chatbot with a user session."""
    client_instance, mocks = client
    
    # Mock user data
    user = {
        '_id': ObjectId(),
        'email': 'test@example.com',
        'name': 'Test User',
        'role': 'user'
    }
    
    # Set up mocks
    mock_redis = mocks['redis_client']
    mock_redis.get.return_value = str(user['_id'])
    
    mocks['users_collection'].find_one.return_value = user
    mocks['orders_collection'].find.return_value = []
    
    # Prepare chat data
    chat_data = {
        'message': 'What are my orders?',
        'session_id': sample_session_id
    }
    
    # Send POST request to chat endpoint
    response = client_instance.post('/api/chat',
                                   data=json.dumps(chat_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'reply' in data
    assert isinstance(data['reply'], str)
    assert len(data['reply']) > 0


# Test error handling and edge cases
def test_get_products_with_invalid_params(client):
    """Test getting products with invalid pagination parameters."""
    client_instance, mocks = client
    
    # Create a mock cursor with skip and limit methods
    mock_cursor = MagicMock()
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = mock_cursor
    mock_cursor.__iter__.return_value = iter([])
    
    # Configure the mocks
    mocks['products_collection'].find.return_value = mock_cursor
    mocks['products_collection'].count_documents.return_value = 0
    
    # Send GET request to products endpoint with invalid params
    response = client_instance.get('/api/products?page=invalid&limit=also_invalid')
    
    # Verify response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Invalid page or limit parameter' in data['error']


def test_add_product_missing_required_fields(client, sample_session_id):
    """Test adding product with missing required fields."""
    client_instance, mocks = client
    
    # Configure mock for session/user verification
    with patch('app.get_user_email_from_session', return_value='seller@example.com'):
        # Prepare product data with missing required field
        product_data = {
            'session_id': sample_session_id,
            # Missing 'name' field which is required
            'price': 49.99,
            'category': 'electronics',
            'stockAvailable': 5
        }
        
        # Send POST request to add product endpoint
        response = client_instance.post('/api/addproducts',
                                       data=json.dumps(product_data),
                                       content_type='application/json')
    
    # Verify response - should return 400 for missing required field
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'name is required' in data['error']


def test_add_to_cart_missing_fields(client, sample_session_id):
    """Test adding to cart with missing required fields."""
    client_instance, mocks = client
    
    # Prepare cart data with missing required field
    cart_data = {
        # Missing session_id
        'product_id': str(ObjectId()),
        'quantity': 2
    }
    
    # Send POST request to add to cart endpoint
    response = client_instance.post('/api/cart',
                                   data=json.dumps(cart_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'session_id and product_id are required' in data['error']


def test_invalid_object_id_handling(client):
    """Test handling of invalid ObjectIds."""
    client_instance, mocks = client
    
    # Send GET request with invalid product ID to recommendations endpoint
    response = client_instance.get('/api/products/invalid_object_id/recommendations')
    
    # Verify response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Invalid product ID format' in data['error']


def test_register_missing_fields(client):
    """Test registration with missing required fields."""
    client_instance, mocks = client
    
    # Prepare registration data with missing password
    user_data = {
        'email': 'test@example.com'
        # Missing 'password' field
    }
    
    # Send POST request to register endpoint
    response = client_instance.post('/api/register',
                                   data=json.dumps(user_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Email and password are required' in data['error']


def test_delete_account_missing_session(client):
    """Test deleting account without session ID."""
    client_instance, mocks = client
    
    # Prepare deletion data without session_id
    delete_data = {}  # Empty data, no session_id
    
    # Send DELETE request to delete account endpoint
    response = client_instance.delete('/api/user',
                                     data=json.dumps(delete_data),
                                     content_type='application/json')
    
    # Verify response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Session ID is required'


def test_create_order_missing_session(client, sample_session_id):
    """Test creating order without session ID."""
    client_instance, mocks = client
    
    # Prepare order data without session_id
    order_data = {
        'shipping_address': '123 Test St',
        'payment_method': 'cod'
    }
    
    # Send POST request to create order endpoint
    response = client_instance.post('/api/orders',
                                   data=json.dumps(order_data),
                                   content_type='application/json')
    
    # Verify response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Session ID is required'


if __name__ == '__main__':
    pytest.main()