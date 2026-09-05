import requests

def test_post_api_auth_login_authenticates_employee_or_manager():
    base_url = "http://localhost:5000/api"
    url = f"{base_url}/auth/login"
    headers = {
        "Content-Type": "application/json"
    }
    # Use demo employee credentials as per instruction
    payload = {
        "identifier": "OI220003",
        "password": "Password@123"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_data = response.json()
        assert "token" in json_data, "JWT token not found in response"
        assert isinstance(json_data["token"], str) and len(json_data["token"]) > 0, "JWT token is empty or not a string"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_login_authenticates_employee_or_manager()