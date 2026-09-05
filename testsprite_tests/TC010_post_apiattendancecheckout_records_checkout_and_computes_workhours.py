import requests

BASE_URL = "http://localhost:5000/api"
EMPLOYEE_IDENTIFIER = "OI220003"
EMPLOYEE_PASSWORD = "Password@123"
TIMEOUT = 30

def test_post_api_attendance_checkout_records_checkout_and_computes_workhours():
    login_url = f"{BASE_URL}/auth/login"
    checkin_url = f"{BASE_URL}/attendance/check-in"
    checkout_url = f"{BASE_URL}/attendance/check-out"

    # Step 1: Authenticate employee and get JWT token
    login_payload = {"identifier": EMPLOYEE_IDENTIFIER, "password": EMPLOYEE_PASSWORD}
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        token = login_data.get("token")
        assert token, "JWT token not found in login response"
    except Exception as e:
        raise AssertionError(f"Login request failed: {e}")

    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Post check-in to create an open attendance punch if not exists
    # This is prerequisite to check-out success
    try:
        checkin_resp = requests.post(checkin_url, headers=headers, timeout=TIMEOUT)
        # If conflict (400) because punch already exists today, it's okay, proceed
        if checkin_resp.status_code not in (200, 400):
            raise AssertionError(f"Unexpected check-in status code: {checkin_resp.status_code} - {checkin_resp.text}")
    except Exception as e:
        raise AssertionError(f"Check-in request failed: {e}")

    # Step 3: Post check-out to record checkout timestamp and compute work hours
    try:
        checkout_resp = requests.post(checkout_url, headers=headers, timeout=TIMEOUT)
        assert checkout_resp.status_code == 200, f"Check-out failed with status {checkout_resp.status_code} - {checkout_resp.text}"
        checkout_data = checkout_resp.json()
        # Validate response includes computed work hours (assuming response JSON has workHours or similar)
        assert "workHours" in checkout_data or "totalWorkHours" in checkout_data, "Work hours not computed or missing in response"
    except Exception as e:
        raise AssertionError(f"Check-out request failed: {e}")

test_post_api_attendance_checkout_records_checkout_and_computes_workhours()