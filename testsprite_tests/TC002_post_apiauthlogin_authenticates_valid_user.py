import requests

def test_post_apiauthlogin_authenticates_valid_user():
    base_url = "http://localhost:5000/api"
    url = f"{base_url}/auth/login"
    headers = {'Content-Type': 'application/json'}
    payload = {
        "identifier": "OI220001",
        "password": "Password@123"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
        json_resp = response.json()
        assert "token" in json_resp and isinstance(json_resp["token"], str) and json_resp["token"], "Missing or invalid token"
        assert "user" in json_resp and isinstance(json_resp["user"], dict) and json_resp["user"], "Missing or invalid user object"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_apiauthlogin_authenticates_valid_user()