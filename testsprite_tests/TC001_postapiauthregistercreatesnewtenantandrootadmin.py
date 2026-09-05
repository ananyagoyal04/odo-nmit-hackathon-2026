import requests
import uuid

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_post_api_auth_register_creates_new_tenant_and_root_admin():
    unique_suffix = uuid.uuid4().hex[:8]
    company_name = f"TestCompany_{unique_suffix}"
    email = f"testadmin_{unique_suffix}@example.com"
    password = "Password@123"

    url = f"{BASE_URL}/auth/register"
    payload = {
        "companyName": company_name,
        "email": email,
        "password": password
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected status 201, got {response.status_code}"
        data = response.json()
        # Optionally verify expected fields in response if known, e.g. company id, user id, etc.
        assert "companyName" in data or "company" in data, "Response missing company info"
        assert email.lower() in response.text.lower(), "Response does not confirm email creation"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_register_creates_new_tenant_and_root_admin()