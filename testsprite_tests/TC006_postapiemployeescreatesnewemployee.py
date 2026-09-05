import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_IDENTIFIER = "OI220001"
ADMIN_PASSWORD = "Password@123"
TIMEOUT = 30

def test_post_api_employees_creates_new_employee():
    # Authenticate as Super Admin to get JWT token
    login_url = f"{BASE_URL}/auth/admin-login"
    login_payload = {
        "identifier": ADMIN_IDENTIFIER,
        "password": ADMIN_PASSWORD
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Authentication failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token, "JWT token missing in auth response"
    except (requests.RequestException, AssertionError) as e:
        raise RuntimeError(f"Failed to authenticate: {e}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Prepare new employee data with required fields
    new_employee_data = {
        "firstName": "TestFirstNameTC006",
        "email": "testemail.tc006@example.com",
        "role": "Employee"
    }

    employee_id = None
    employees_url = f"{BASE_URL}/employees"

    try:
        # Create new employee
        create_resp = requests.post(employees_url, json=new_employee_data, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Expected HTTP 201, got {create_resp.status_code}"
        created_employee = create_resp.json()

        # Validate returned employee data contains required fields and matches input
        assert "firstName" in created_employee, "Response missing firstName"
        assert "email" in created_employee, "Response missing email"
        assert "role" in created_employee, "Response missing role"
        assert created_employee["firstName"] == new_employee_data["firstName"], "firstName mismatch"
        assert created_employee["email"] == new_employee_data["email"], "email mismatch"
        assert created_employee["role"] == new_employee_data["role"], "role mismatch"
        assert "id" in created_employee, "Created employee ID missing in response"

        employee_id = created_employee["id"]
    finally:
        # Cleanup: delete created employee if created successfully to keep data clean
        if employee_id:
            try:
                delete_url = f"{employees_url}/{employee_id}"
                delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # We do not assert on deletion, just ensure no unhandled exceptions
            except requests.RequestException:
                pass

test_post_api_employees_creates_new_employee()