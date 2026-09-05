import requests

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30
ADMIN_LOGIN_ENDPOINT = "/auth/admin-login"
EMPLOYEES_ENDPOINT = "/employees"


def test_get_api_employees_lists_company_employees():
    # Credentials for HR user (as HR or Super Admin has elevated permissions)
    credentials = {
        "identifier": "OI220002",
        "password": "Password@123"
    }

    try:
        # Authenticate HR user to obtain JWT token
        login_resp = requests.post(
            BASE_URL + ADMIN_LOGIN_ENDPOINT,
            json=credentials,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
        token = login_resp.json().get("token")
        assert token, "JWT token not found in admin login response"

        headers = {"Authorization": f"Bearer {token}"}

        # Request list of employees
        employees_resp = requests.get(
            BASE_URL + EMPLOYEES_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert employees_resp.status_code == 200, f"Employees list fetch failed: {employees_resp.text}"

        employees_data = employees_resp.json()
        assert isinstance(employees_data, list), "Employees response is not a list"

    except requests.RequestException as e:
        assert False, f"Request exception occurred: {str(e)}"


test_get_api_employees_lists_company_employees()