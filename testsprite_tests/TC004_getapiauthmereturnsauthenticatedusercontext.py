import requests

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_getapiauthme_returns_authenticated_user_context():
    login_url = f"{BASE_URL}/auth/admin-login"
    auth_me_url = f"{BASE_URL}/auth/me"

    credentials = {
        "identifier": "OI220001",
        "password": "Password@123"
    }

    try:
        # Authenticate as Super Admin to get JWT token
        login_resp = requests.post(login_url, json=credentials, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "token" in login_data, "JWT token not found in login response"
        token = login_data["token"]

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Request authenticated user context
        auth_me_resp = requests.get(auth_me_url, headers=headers, timeout=TIMEOUT)
        assert auth_me_resp.status_code == 200, f"/auth/me failed with status {auth_me_resp.status_code}"

        user_context = auth_me_resp.json()
        # Validate presence of user and company data keys (assumed keys)
        assert isinstance(user_context, dict), "Response is not a JSON object"
        assert "user" in user_context, "'user' key missing in response"
        assert "company" in user_context, "'company' key missing in response"

        # Additional minimal checks on user and company data
        user = user_context["user"]
        company = user_context["company"]
        assert isinstance(user, dict), "'user' is not an object"
        assert isinstance(company, dict), "'company' is not an object"
        assert "id" in user and user["id"], "'user.id' missing or empty"
        assert "name" in company and company["name"], "'company.name' missing or empty"

    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Test failed: {e}")

test_getapiauthme_returns_authenticated_user_context()