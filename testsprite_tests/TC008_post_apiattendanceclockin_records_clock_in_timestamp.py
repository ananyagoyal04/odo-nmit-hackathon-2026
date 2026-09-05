import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"
CLOCK_IN_URL = f"{BASE_URL}/attendance/clock-in"
TIMEOUT = 30

def test_post_api_attendance_clock_in_records_clock_in_timestamp():
    # Login as Employee (identifier OI220003)
    login_payload = {"identifier": "OI220003", "password": "Password@123"}
    try:
        login_response = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        login_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"
    login_data = login_response.json()
    token = login_data.get("token")
    assert token, "Login response missing token"

    headers = {"Authorization": f"Bearer {token}"}

    # POST /api/attendance/clock-in
    try:
        clock_in_response = requests.post(CLOCK_IN_URL, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Clock-in request failed: {e}"

    assert clock_in_response.status_code == 200, f"Expected 200, got {clock_in_response.status_code}"

test_post_api_attendance_clock_in_records_clock_in_timestamp()