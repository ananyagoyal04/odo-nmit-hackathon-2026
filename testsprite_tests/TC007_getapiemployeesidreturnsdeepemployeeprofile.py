import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_IDENTIFIER = "OI220001"
ADMIN_PASSWORD = "Password@123"
TIMEOUT = 30


def get_jwt_token(identifier: str, password: str) -> str:
    url = f"{BASE_URL}/auth/admin-login"
    payload = {"identifier": identifier, "password": password}
    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    token = data.get("token")
    assert token, "JWT token not found in admin-login response"
    return token


def create_employee(token: str, first_name: str, email: str, role: str) -> dict:
    url = f"{BASE_URL}/employees"
    payload = {
        "firstName": first_name,
        "email": email,
        "role": role
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    assert resp.status_code == 201
    return resp.json()


def delete_employee(token: str, employee_id: int):
    url = f"{BASE_URL}/employees/{employee_id}"
    headers = {
        "Authorization": f"Bearer {token}",
    }
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    # delete might not be supported, so no assertion here
    # just attempt and ignore errors


def test_getapiemployeesidreturnsdeepemployeeprofile_tc007():
    token = get_jwt_token(ADMIN_IDENTIFIER, ADMIN_PASSWORD)

    # Create a new employee to test the detailed profile retrieval
    employee_data = None
    try:
        employee_data = create_employee(token, "TestProfile", "testprofile@example.com", "Employee")
        employee_id = employee_data.get("id") or employee_data.get("employeeId")
        assert employee_id is not None, "Employee ID not found in creation response"

        # GET /api/employees/:id with valid JWT token
        url = f"{BASE_URL}/employees/{employee_id}"
        headers = {
            "Authorization": f"Bearer {token}",
        }
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200

        profile = resp.json()
        # Validate some expected keys in the detailed profile dossier
        assert isinstance(profile, dict)
        # Check typical expected fields in detailed profile (best effort since schema not detailed)
        expected_keys = ["id", "firstName", "email", "role"]
        for key in expected_keys:
            assert key in profile

    finally:
        if employee_data:
            # Delete created employee, ignoring errors if delete unsupported
            try:
                delete_employee(token, employee_id)
            except Exception:
                pass


test_getapiemployeesidreturnsdeepemployeeprofile_tc007()