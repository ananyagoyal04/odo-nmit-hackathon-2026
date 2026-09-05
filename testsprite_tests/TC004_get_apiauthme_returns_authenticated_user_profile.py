import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"
AUTH_ME_ENDPOINT = f"{BASE_URL}/auth/me"
TIMEOUT = 30

def test_get_apiauthme_returns_authenticated_user_profile():
    login_payload = {
        "identifier": "OI220001",
        "password": "Password@123"
    }
    try:
        # Login to get JWT token
        login_response = requests.post(LOGIN_ENDPOINT, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_data = login_response.json()
        token = login_data.get("token")
        assert token and isinstance(token, str), "JWT token not found in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Call /api/auth/me with bearer token
        auth_me_response = requests.get(AUTH_ME_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert auth_me_response.status_code == 200, f"/api/auth/me returned status {auth_me_response.status_code}"

        auth_me_data = auth_me_response.json()
        # Verify presence of user profile info
        assert "user" in auth_me_data or "profile" in auth_me_data, "User profile data missing in response"
        # Verify presence of company metadata
        assert "company" in auth_me_data or "companyMetadata" in auth_me_data, "Company metadata missing in response"

    except requests.RequestException as e:
        assert False, f"Request failed: {str(e)}"

test_get_apiauthme_returns_authenticated_user_profile()