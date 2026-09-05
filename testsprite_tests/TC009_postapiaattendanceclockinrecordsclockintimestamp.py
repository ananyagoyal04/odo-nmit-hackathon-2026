import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_IDENTIFIER = "OI220001"
ADMIN_PASSWORD = "Password@123"
TIMEOUT = 30

def test_post_api_attendance_clock_in_records_clock_in_timestamp():
    login_url = f"{BASE_URL}/auth/admin-login"
    clock_in_url = f"{BASE_URL}/attendance/clock-in"
    
    # Authenticate as Super Admin to get JWT token
    try:
        login_resp = requests.post(
            login_url,
            json={"identifier": ADMIN_IDENTIFIER, "password": ADMIN_PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Admin login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token, "JWT token missing in admin login response"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Post to clock-in attendance
        clock_in_resp = requests.post(clock_in_url, headers=headers, timeout=TIMEOUT)
        assert clock_in_resp.status_code == 200, f"Clock-in API returned status {clock_in_resp.status_code}"
        resp_json = clock_in_resp.json()
        assert "clockInTimestamp" in resp_json, "Response missing 'clockInTimestamp'"
        # Optionally validate that the timestamp is a non-empty string
        assert isinstance(resp_json["clockInTimestamp"], str) and resp_json["clockInTimestamp"].strip(), "Invalid 'clockInTimestamp' value"
        
    except requests.exceptions.RequestException as e:
        assert False, f"Request exception occurred: {e}"

test_post_api_attendance_clock_in_records_clock_in_timestamp()