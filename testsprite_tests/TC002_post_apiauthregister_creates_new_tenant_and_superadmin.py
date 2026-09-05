import requests
import uuid

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_post_apiauthregister_creates_new_tenant_and_superadmin():
    url = f"{BASE_URL}/auth/register"
    unique_suffix = str(uuid.uuid4()).replace('-', '')[:8]
    company_name = f"TestCompany{unique_suffix}"
    company_email = f"test{unique_suffix}@example.com"
    admin_name = "Test Admin"
    admin_email = f"admin{unique_suffix}@example.com"
    password = "Password@123"
    
    payload = {
        "companyName": company_name,
        "companyEmail": company_email,
        "adminName": admin_name,
        "adminEmail": admin_email,
        "password": password,
        "confirmPassword": password
    }
    
    try:
        response = requests.post(url, json=payload, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        # Optionally check response body if needed (not specified in PRD)
        
        # Additional verification: attempt to login with new admin to confirm creation
        login_url = f"{BASE_URL}/auth/login"
        login_payload = {
            "identifier": admin_email,
            "password": password
        }
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        json_login = login_resp.json()
        assert "token" in json_login and isinstance(json_login["token"], str) and json_login["token"], "JWT token missing or empty"
        
    finally:
        # No endpoint given for tenant or admin deletion, so cannot cleanup created resource
        pass

test_post_apiauthregister_creates_new_tenant_and_superadmin()