import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"
EMPLOYEES_URL = f"{BASE_URL}/employees"
TIMEOUT = 30

def test_get_apiemployees_lists_employees_for_tenant():
    # Login to get JWT token
    login_payload = {
        "identifier": "OI220001",
        "password": "Password@123"
    }
    try:
        login_response = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        token = login_response.json().get("token")
        assert token, "Token not found in login response"
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        # Call GET /api/employees to list employees
        resp = requests.get(EMPLOYEES_URL, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}"
        
        json_data = resp.json()
        # Assert the response is a list or has an employees list key
        # The PRD doesn't specify the exact response format, so at least check type
        assert isinstance(json_data, list) or isinstance(json_data, dict), "Unexpected response format"
        
        # Optional: if dict, check for employees list
        if isinstance(json_data, dict):
            # If employees are under some key, e.g. "employees", validate existence
            employees = json_data.get("employees")
            assert employees is None or isinstance(employees, list), "Employees field should be a list if present"
        
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_apiemployees_lists_employees_for_tenant()