import requests
import json

# Test the delete endpoint directly
BASE_URL = "http://localhost:5000"

# First register a test user
register_data = {
    "email": "test_delete2@example.com",
    "password": "testpassword123"
}

register_resp = requests.post(f"{BASE_URL}/api/register", json=register_data)
print("Registration:", register_resp.status_code, register_resp.text)

# Login to get session ID
login_data = {
    "email": "test_delete2@example.com",
    "password": "testpassword123"
}

login_resp = requests.post(f"{BASE_URL}/api/login", json=login_data)
print("Login:", login_resp.status_code, login_resp.text)

if login_resp.status_code == 200:
    session_id = login_resp.json().get("session_id")
    print("Session ID:", session_id)
    
    # Test delete with session ID
    delete_data = {
        "session_id": session_id
    }
    
    try:
        delete_resp = requests.delete(f"{BASE_URL}/api/user", json=delete_data)
        print("Delete status code:", delete_resp.status_code)
        print("Delete response text:", delete_resp.text)
        
        # Try to parse as JSON
        try:
            resp_json = delete_resp.json()
            print("Delete response JSON:", resp_json)
        except:
            print("Could not parse response as JSON")
            
    except Exception as e:
        print("Error during delete request:", e)