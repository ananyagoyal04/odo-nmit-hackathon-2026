import requests
from datetime import datetime
import traceback

BASE_URL = "http://localhost:5000/api"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"
EMPLOYEES_ENDPOINT = f"{BASE_URL}/employees"
TIMEOUT = 30

def test_post_apiemployees_creates_new_employee():
    # Authenticate as Super Admin to create employee
    auth_payload = {"identifier": "OI220001", "password": "Password@123"}
    headers = {"Content-Type": "application/json"}

    try:
        auth_resp = requests.post(LOGIN_ENDPOINT, json=auth_payload, headers=headers, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Auth failed with status {auth_resp.status_code}"
        auth_data = auth_resp.json()
        token = auth_data.get("token")
        assert token, "No token in auth response"
        auth_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # Create a new employee with required fields
        now = datetime.utcnow()
        joining_date = now.strftime("%Y-%m-%d")
        new_employee_data = {
            "firstName": "TestFirstName",
            "email": f"testemployee_{now.strftime('%Y%m%d%H%M%S')}@example.com",
            "role": "Employee",
            "joiningDate": joining_date
        }
        post_resp = requests.post(EMPLOYEES_ENDPOINT, json=new_employee_data, headers=auth_headers, timeout=TIMEOUT)
        assert post_resp.status_code == 201, f"Expected HTTP 201, got {post_resp.status_code}"

        post_resp_json = post_resp.json()
        # Confirm auto-generated login ID is present and non-empty string
        login_id = post_resp_json.get("loginId") or post_resp_json.get("loginID") or post_resp_json.get("login_id")
        # support multiple common key styles, else try to find any string id if possible
        if not login_id:
            # try to check top-level keys resembling login id heuristically
            for key, value in post_resp_json.items():
                if isinstance(value, str) and "login" in key.lower() and len(value) > 0:
                    login_id = value
                    break

        assert login_id and isinstance(login_id, str) and login_id.strip(), "Auto-generated login ID missing or invalid"

    except AssertionError as ae:
        raise ae
    except Exception:
        traceback.print_exc()
        raise

test_post_apiemployees_creates_new_employee()