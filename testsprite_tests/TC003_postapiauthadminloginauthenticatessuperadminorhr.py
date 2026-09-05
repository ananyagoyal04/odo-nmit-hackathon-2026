import requests

def test_post_api_auth_admin_login_authenticates_superadmin_or_hr():
    base_url = "http://localhost:5000/api/auth/admin-login"
    headers = {"Content-Type": "application/json"}
    credentials = [
        {"identifier": "OI220001", "password": "Password@123"},  # Super Admin
        {"identifier": "OI220002", "password": "Password@123"}   # HR
    ]
    timeout = 30

    for cred in credentials:
        try:
            response = requests.post(base_url, json=cred, headers=headers, timeout=timeout)
            assert response.status_code == 200, f"Expected 200, got {response.status_code} for {cred['identifier']}"

            json_response = response.json()
            assert "token" in json_response, f"No JWT token returned for {cred['identifier']}"
            assert isinstance(json_response["token"], str) and len(json_response["token"]) > 0, f"Invalid JWT token for {cred['identifier']}"

        except requests.RequestException as e:
            assert False, f"Request failed for {cred['identifier']}: {str(e)}"

test_post_api_auth_admin_login_authenticates_superadmin_or_hr()