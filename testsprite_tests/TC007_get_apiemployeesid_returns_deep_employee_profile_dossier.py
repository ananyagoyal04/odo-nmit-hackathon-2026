import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"
EMPLOYEES_ENDPOINT = f"{BASE_URL}/employees"
TIMEOUT = 30

def test_get_apiemployeesid_returns_deep_employee_profile_dossier():
    # Authenticate as admin to create an employee and get token
    admin_credentials = {
        "identifier": "OI220001",
        "password": "Password@123"
    }
    try:
        login_resp = requests.post(LOGIN_ENDPOINT, json=admin_credentials, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
        token = login_resp.json().get("token") or login_resp.json().get("accessToken")
        assert token, "JWT token not found in login response"
        headers = {"Authorization": f"Bearer {token}"}

        # Create a new employee to get a valid employee ID
        new_employee_payload = {
            "firstName": "TestEmployee",
            "email": "testemployee@example.com",
            "role": "EMPLOYEE",
            "joiningDate": "2023-01-01"
        }
        create_resp = requests.post(EMPLOYEES_ENDPOINT, json=new_employee_payload, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Employee creation failed: {create_resp.text}"
        employee_data = create_resp.json()
        employee_id = employee_data.get("id")
        assert employee_id, "Employee ID not found in create employee response"

        # Get deep employee profile dossier
        employee_profile_url = f"{EMPLOYEES_ENDPOINT}/{employee_id}"
        profile_resp = requests.get(employee_profile_url, headers=headers, timeout=TIMEOUT)
        assert profile_resp.status_code == 200, f"Failed to get employee profile dossier: {profile_resp.text}"
        profile_json = profile_resp.json()

        # Validate some expected fields in profile dossier assuming deep profile has these keys
        assert isinstance(profile_json, dict), "Profile dossier is not a JSON object"
        assert "id" in profile_json and profile_json["id"] == employee_id, "Returned profile ID mismatch"
        assert "firstName" in profile_json and profile_json["firstName"] == new_employee_payload["firstName"]
        assert "email" in profile_json and profile_json["email"] == new_employee_payload["email"]
        # Further validations can be added as per deep employee profile structure

    finally:
        # Clean up: delete the created employee if exists
        if 'headers' in locals() and 'employee_id' in locals():
            requests.delete(f"{EMPLOYEES_ENDPOINT}/{employee_id}", headers=headers, timeout=TIMEOUT)

test_get_apiemployeesid_returns_deep_employee_profile_dossier()