import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_IDENTIFIER = "OI220001"
ADMIN_PASSWORD = "Password@123"
TIMEOUT = 30

def test_get_employee_salary_statutory_ctc_breakdown():
    # Step 1: Authenticate as Super Admin to get JWT token
    login_url = f"{BASE_URL}/auth/admin-login"
    login_payload = {
        "identifier": ADMIN_IDENTIFIER,
        "password": ADMIN_PASSWORD
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Admin login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token, "JWT token not found in login response"
    except requests.RequestException as e:
        raise Exception(f"Request error during admin login: {e}")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Step 2: List employees to get a valid employee ID
    employees_url = f"{BASE_URL}/employees"
    try:
        employees_resp = requests.get(employees_url, headers=headers, timeout=TIMEOUT)
        assert employees_resp.status_code == 200, f"Get employees failed with status {employees_resp.status_code}"
        employees = employees_resp.json()
        assert isinstance(employees, list) and len(employees) > 0, "Employee list is empty or not a list"
        employee_id = employees[0].get("id") or employees[0].get("_id") or employees[0].get("employeeId")
        assert employee_id, "Employee ID not found in employee data"
    except requests.RequestException as e:
        raise Exception(f"Request error during get employees: {e}")

    # Step 3: Get statutory CTC salary breakdown for the employee
    salary_url = f"{BASE_URL}/employees/{employee_id}/salary"
    try:
        salary_resp = requests.get(salary_url, headers=headers, timeout=TIMEOUT)
        assert salary_resp.status_code == 200, f"Get salary failed with status {salary_resp.status_code}"
        salary_data = salary_resp.json()
        # Validate presence of statutory CTC salary breakdown keys (sample keys based on typical salary breakdown)
        expected_keys = ["statutoryCTC", "basic", "hra", "conveyance", "medicalAllowance", "specialAllowance", "employerPF", "gratuity"]
        for key in expected_keys:
            assert key in salary_data, f"Key '{key}' missing from salary breakdown"
    except requests.RequestException as e:
        raise Exception(f"Request error during get employee salary: {e}")

test_get_employee_salary_statutory_ctc_breakdown()