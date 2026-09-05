import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_ENDPOINT = "/auth/login"
CLOCK_IN_ENDPOINT = "/attendance/clock-in"
CLOCK_OUT_ENDPOINT = "/attendance/clock-out"
TIMEOUT = 30

def login_employee():
    url = f"{BASE_URL}{LOGIN_ENDPOINT}"
    payload = {
        "identifier": "OI220003",
        "password": "Password@123"
    }
    response = requests.post(url, json=payload, timeout=TIMEOUT)
    response.raise_for_status()
    token = response.json().get("token")
    assert token is not None, "Token not found in login response"
    return token

def test_post_apiattendanceclockout_records_clock_out_and_work_hours():
    token = None
    headers = {}
    try:
        # Authenticate as employee
        token = login_employee()
        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Ensure clock-in exists before clock-out
        clock_in_resp = requests.post(f"{BASE_URL}{CLOCK_IN_ENDPOINT}", headers=headers, timeout=TIMEOUT)
        if clock_in_resp.status_code not in (200, 400):
            clock_in_resp.raise_for_status()
        # If status 400, it may mean duplicate clock-in for today which is acceptable for test continuation

        # Perform clock-out
        clock_out_resp = requests.post(f"{BASE_URL}{CLOCK_OUT_ENDPOINT}", headers=headers, timeout=TIMEOUT)

        assert clock_out_resp.status_code == 200, f"Expected status 200, got {clock_out_resp.status_code}"
        clock_out_data = clock_out_resp.json()
        assert "clockOutTime" in clock_out_data or "clock_out_time" in clock_out_data, "Response missing clock out timestamp"
        assert "totalWorkHours" in clock_out_data or "total_work_hours" in clock_out_data, "Response missing total work hours"

        # Additional sanity checks on times and work hours
        clock_out_time = clock_out_data.get("clockOutTime") or clock_out_data.get("clock_out_time")
        total_work_hours = clock_out_data.get("totalWorkHours") or clock_out_data.get("total_work_hours")
        assert isinstance(clock_out_time, str) and clock_out_time.strip() != "", "clockOutTime should be a non-empty string"
        assert (isinstance(total_work_hours, (int, float)) and total_work_hours >= 0), "totalWorkHours should be a non-negative number"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_apiattendanceclockout_records_clock_out_and_work_hours()
