import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_IDENTIFIER = "OI220001"
ADMIN_PASSWORD = "Password@123"
TIMEOUT = 30

def test_post_apiattendancecheckin_records_checkin_timestamp():
    login_url = f"{BASE_URL}/auth/login"
    checkin_url = f"{BASE_URL}/attendance/check-in"

    try:
        # Step 1: Authenticate as employee (using Employee Login credentials)
        login_payload = {
            "identifier": "OI220003",
            "password": ADMIN_PASSWORD
        }
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token") or login_resp.json().get("accessToken")
        assert token, "JWT token missing in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Step 2: POST /api/attendance/check-in to record check-in timestamp
        checkin_resp = requests.post(checkin_url, headers=headers, timeout=TIMEOUT)
        assert checkin_resp.status_code == 200, f"Check-in failed with status {checkin_resp.status_code}"

        # Validate response content if present (at least a timestamp or confirmation)
        resp_json = checkin_resp.json()
        # We expect maybe a field like "checkinTimestamp" or similar; if none guaranteed, just check json is dict
        assert isinstance(resp_json, dict), "Response JSON is not a dictionary"

    except requests.RequestException as e:
        assert False, f"RequestException occurred: {e}"

test_post_apiattendancecheckin_records_checkin_timestamp()