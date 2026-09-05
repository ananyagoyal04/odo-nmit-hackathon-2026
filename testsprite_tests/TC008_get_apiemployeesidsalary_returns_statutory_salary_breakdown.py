import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"
EMPLOYEES_URL = f"{BASE_URL}/employees"

ADMIN_CREDENTIALS = {"identifier": "OI220001", "password": "Password@123"}

def test_get_apiemployeesidsalary_returns_statutory_salary_breakdown():
    headers = {"Content-Type": "application/json"}
    session = requests.Session()
    try:
        # Authenticate as admin to get token
        login_resp = session.post(
            LOGIN_URL,
            json=ADMIN_CREDENTIALS,
            timeout=30,
            headers=headers
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token") or login_resp.json().get("accessToken")
        assert token, "No token received on login"
        auth_headers = {"Authorization": f"Bearer {token}"}

        # Get list of employees to get a valid employee id
        emp_list_resp = session.get(EMPLOYEES_URL, headers=auth_headers, timeout=30)
        assert emp_list_resp.status_code == 200, f"Failed to list employees with status {emp_list_resp.status_code}"
        employees = emp_list_resp.json()
        assert isinstance(employees, list) and employees, "Employee list is empty or invalid"

        employee_id = employees[0].get("id") or employees[0].get("employeeId") or employees[0].get("id")
        assert employee_id, "No valid employee ID found in employee list"

        # Call the salary breakdown endpoint for the employee
        salary_url = f"{EMPLOYEES_URL}/{employee_id}/salary"
        salary_resp = session.get(salary_url, headers=auth_headers, timeout=30)
        assert salary_resp.status_code == 200, f"Salary API returned status {salary_resp.status_code}"

        salary_data = salary_resp.json()
        # Validate minimal presence of statutory CTC elements in response
        # As PRD does not explicitly specify response schema, check presence of key typical fields
        assert isinstance(salary_data, dict), "Salary response is not a dictionary"

        # Typical statutory salary breakdown keys (may vary)
        expected_keys = [
            "statutoryCTC",
            "basic",
            "hra",
            "providentFund",
            "medicalAllowance",
            "specialAllowance",
            "grossSalary",
            "netSalary"
        ]
        present_keys = set(salary_data.keys())
        assert any(key in present_keys for key in expected_keys), "Salary breakdown missing expected statutory keys"

    finally:
        session.close()

test_get_apiemployeesidsalary_returns_statutory_salary_breakdown()