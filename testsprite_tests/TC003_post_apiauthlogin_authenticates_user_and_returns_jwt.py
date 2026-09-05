import requests

def test_post_apiauthlogin_authenticates_user_and_returns_jwt():
    base_url = "http://localhost:5000/api"
    url = f"{base_url}/auth/login"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "identifier": "OI220001",
        "password": "Password@123"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_resp = response.json()
        assert "token" in json_resp or "jwt" in json_resp, "JWT token not found in response"
        token = json_resp.get("token") or json_resp.get("jwt")
        assert isinstance(token, str) and len(token) > 0, "JWT token is empty or not a string"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_apiauthlogin_authenticates_user_and_returns_jwt()