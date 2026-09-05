import requests
import uuid

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_post_apiauthregister_creates_new_tenant_and_super_admin():
    # Prepare unique company and admin details to avoid conflicts
    unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
    company_name = f"TestCompany_{unique_suffix}"
    company_email = f"contact_{unique_suffix}@testcompany.com"
    admin_name = f"Admin_{unique_suffix}"
    admin_email = f"admin_{unique_suffix}@testcompany.com"
    password = "StrongPass@123"
    confirm_password = password

    register_url = f"{BASE_URL}/auth/register"
    login_url = f"{BASE_URL}/auth/login"
    me_url = f"{BASE_URL}/auth/me"

    register_payload = {
        "companyName": company_name,
        "companyEmail": company_email,
        "adminName": admin_name,
        "adminEmail": admin_email,
        "password": password,
        "confirmPassword": confirm_password
    }

    # Register new tenant and root super admin
    try:
        register_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert register_resp.status_code == 201, f"Expected status 201, got {register_resp.status_code}"

        # Login with the newly created admin credentials
        login_payload = {
            "identifier": admin_email,
            "password": password
        }
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Expected status 200 on login, got {login_resp.status_code}"

        login_data = login_resp.json()
        assert "token" in login_data and isinstance(login_data["token"], str) and login_data["token"], "Missing or invalid token in login response"
        assert "user" in login_data and isinstance(login_data["user"], dict), "Missing or invalid user object in login response"

        token = login_data["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Retrieve authenticated user profile and company metadata
        me_resp = requests.get(me_url, headers=headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"Expected status 200 on /auth/me, got {me_resp.status_code}"

        me_data = me_resp.json()
        assert isinstance(me_data, dict), "Expected response JSON object from /auth/me"
        # Basic checks on user and company metadata presence in profile context
        assert "user" in me_data or "company" in me_data, "User or company metadata missing in /auth/me response"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_apiauthregister_creates_new_tenant_and_super_admin()