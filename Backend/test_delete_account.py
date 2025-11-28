import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_delete_account():
    print("Testing delete account functionality...")
    
    # First, register a test user
    print("1. Registering a test user...")
    register_data = {
        "email": "test_delete@example.com",
        "password": "testpassword123"
    }
    
    register_response = requests.post(f"{BASE_URL}/api/register", json=register_data)
    print(f"Registration response: {register_response.status_code} - {register_response.json()}")
    
    if register_response.status_code != 201:
        print("Failed to register test user")
        return
    
    # Login to get session ID
    print("2. Logging in to get session ID...")
    login_data = {
        "email": "test_delete@example.com",
        "password": "testpassword123"
    }
    
    login_response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    print(f"Login response: {login_response.status_code} - {login_response.json()}")
    
    if login_response.status_code != 200:
        print("Failed to login test user")
        return
    
    session_id = login_response.json().get("session_id")
    if not session_id:
        print("No session ID returned from login")
        return
    
    print(f"Session ID: {session_id}")
    
    # Now delete the account
    print("3. Deleting the account...")
    delete_data = {
        "session_id": session_id
    }
    
    delete_response = requests.delete(f"{BASE_URL}/api/user", json=delete_data)
    print(f"Delete response: {delete_response.status_code} - {delete_response.json()}")
    
    if delete_response.status_code == 200:
        print("✅ Account deletion test passed successfully!")
    else:
        print("❌ Account deletion test failed!")
        
    # Try to login again with deleted account (should fail)
    print("4. Verifying account was deleted by attempting to login again...")
    retry_login_response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    print(f"Retry login response: {retry_login_response.status_code} - {retry_login_response.json()}")
    
    if retry_login_response.status_code == 401:
        print("✅ Account verification passed - account was successfully deleted!")
    else:
        print("❌ Account verification failed - account may not have been properly deleted!")

if __name__ == "__main__":
    test_delete_account()