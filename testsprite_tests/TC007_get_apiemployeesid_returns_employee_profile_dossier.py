import requests
import datetime

BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"
EMPLOYEES_URL = f"{BASE_URL}/employees"
TIMEOUT = 30

SUPERADMIN_CREDENTIALS = {
    "identifier": "OI220001",
    "password": "Password@123"
}


def login(credentials):
    resp = requests.post(LOGIN_URL, json=credentials, timeout=TIMEOUT)
    resp.raise_for_status()
    token = resp.json().get("token")
    assert token, "Login response missing token"
    return token


def create_employee(token):
    headers = {"Authorization": f"Bearer {token}"}
    # Use unique email using timestamp to avoid duplication
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    employee_data = {
        "firstName": "TestEmployee",
        "email": f"testemployee_{timestamp}@example.com",
        "role": "Employee",
        "joiningDate": datetime.datetime.utcnow().strftime("%Y-%m-%d")
    }
    resp = requests.post(EMPLOYEES_URL, json=employee_data, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
    employee = resp.json()
    employee_id = employee.get("id") or employee.get("ID") or employee.get("employeeId")
    if not employee_id:
        # Sometimes ID might be nested or differently named, fallback to searching keys
        for key in employee:
            if key.lower().endswith("id"):
                employee_id = employee[key]
                break
    assert employee_id, "Created employee response missing ID"
    return employee_id


def delete_employee(employee_id, token):
    # No DELETE endpoint specified for employees in PRD, so skipping deletion.
    # If DELETE existed, use it here.
    pass


def test_get_apiemployeesid_returns_employee_profile_dossier():
    token = login(SUPERADMIN_CREDENTIALS)
    headers = {"Authorization": f"Bearer {token}"}

    employee_id = None
    try:
        # Get an existing employee ID by listing employees (alternative if creation unnecessary)
        resp_list = requests.get(EMPLOYEES_URL, headers=headers, timeout=TIMEOUT)
        resp_list.raise_for_status()
        employees = resp_list.json()
        if isinstance(employees, dict) and "data" in employees:
            employees = employees["data"]
        if employees and isinstance(employees, list):
            employee_id = employees[0].get("id") or employees[0].get("ID") or employees[0].get("employeeId")

        if not employee_id:
            # No existing employee found, create one
            employee_id = create_employee(token)

        # Now get employee profile dossier by ID
        resp = requests.get(f"{EMPLOYEES_URL}/{employee_id}", headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}"
        dossier = resp.json()
        assert isinstance(dossier, dict), "Employee profile dossier response is not a JSON object"
        # Basic checks for some expected fields in dossier
        expected_fields = ["id", "firstName", "email", "role", "joiningDate"]
        for field in expected_fields:
            assert field in dossier, f"Expected field '{field}' missing in employee dossier"
    finally:
        if employee_id and 'create_employee' in locals():
            # Cleanup only if employee was created by this test
            # No DELETE endpoint specified; skipping deletion as per PRD.
            pass


test_get_apiemployeesid_returns_employee_profile_dossier()