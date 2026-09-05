import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"
EMPLOYEES_ENDPOINT = f"{BASE_URL}/employees"
TIMEOUT = 30

def test_get_apiemployees_lists_company_employees():
    # Login as Employee (identifier: "OI220003")
    login_payload = {
        "identifier": "OI220003",
        "password": "Password@123"
    }
    try:
        login_resp = requests.post(LOGIN_ENDPOINT, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        token = login_data.get("token")
        assert token, "No token received in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        # Get the list of company employees
        resp = requests.get(EMPLOYEES_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"GET /api/employees returned {resp.status_code}"
        data = resp.json()
        assert isinstance(data, dict), "Response is not a JSON object"
        assert "employees" in data, "Response JSON does not contain 'employees' key"
        assert isinstance(data["employees"], list), "'employees' key is not a list"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_apiemployees_lists_company_employees()
