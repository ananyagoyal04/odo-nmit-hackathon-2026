import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_CREDENTIALS = {"identifier": "OI220001", "password": "Password@123"}
TIMEOUT = 30

def test_post_apiemployees_creates_new_employee_record():
    login_url = f"{BASE_URL}/auth/login"
    employees_url = f"{BASE_URL}/employees"

    headers = {}
    try:
        login_resp = requests.post(login_url, json=ADMIN_CREDENTIALS, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token, "JWT token not found in login response"
        headers = {"Authorization": f"Bearer {token}"}

        new_employee = {
            "firstName": "TestFirstNameTC006",
            "email": "testemployee_tc006@example.com",
            "role": "Employee",
            "joiningDate": "2024-01-15"
        }

        post_resp = requests.post(employees_url, json=new_employee, headers=headers, timeout=TIMEOUT)
        assert post_resp.status_code == 201, f"Expected status 201, got {post_resp.status_code}"
        employee_data = post_resp.json()
        assert employee_data.get("firstName") == new_employee["firstName"], "firstName mismatch"
        assert employee_data.get("email") == new_employee["email"], "email mismatch"
        assert employee_data.get("role") == new_employee["role"], "role mismatch"
        assert employee_data.get("joiningDate") == new_employee["joiningDate"], "joiningDate mismatch"
        assert "id" in employee_data, "Created employee record missing 'id'"

    finally:
        if headers and 'employee_data' in locals() and employee_data.get("id"):
            emp_id = employee_data["id"]
            try:
                delete_resp = requests.delete(f"{employees_url}/{emp_id}", headers=headers, timeout=TIMEOUT)
                assert delete_resp.status_code in (200,204), f"Failed to delete test employee with status {delete_resp.status_code}"
            except Exception:
                pass


test_post_apiemployees_creates_new_employee_record()