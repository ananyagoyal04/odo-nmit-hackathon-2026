import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_LOGIN_ENDPOINT = "/auth/admin-login"
CLOCK_IN_ENDPOINT = "/attendance/clock-in"
CLOCK_OUT_ENDPOINT = "/attendance/clock-out"
TIMEOUT = 30

demo_credentials = {
    "identifier": "OI220003",
    "password": "Password@123"
}

def test_post_api_attendance_clock_out_records_clock_out_and_work_hours():
    session = requests.Session()
    try:
        # Authenticate employee to get JWT token
        login_resp = session.post(
            BASE_URL + "/auth/login",
            json=demo_credentials,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token, "Token missing in login response"

        headers = {"Authorization": f"Bearer {token}"}

        # First, ensure the user has clocked in (to allow clock out)
        clock_in_resp = session.post(
            BASE_URL + CLOCK_IN_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert clock_in_resp.status_code == 200, f"Clock-in failed with status {clock_in_resp.status_code}"

        # Then clock out and check work hours recorded
        clock_out_resp = session.post(
            BASE_URL + CLOCK_OUT_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert clock_out_resp.status_code == 200, f"Clock-out failed with status {clock_out_resp.status_code}"
        clock_out_data = clock_out_resp.json()

        # Validate expected fields in the response
        assert "clockOutTime" in clock_out_data, "clockOutTime not in response"
        assert "totalWorkHours" in clock_out_data, "totalWorkHours not in response"
        # totalWorkHours should be a number and positive
        total_hours = clock_out_data["totalWorkHours"]
        assert isinstance(total_hours, (int, float)), "totalWorkHours is not numeric"
        assert total_hours >= 0, "totalWorkHours is negative"

    finally:
        # Cleanup: If needed, can add clock-in/clock-out cleanup logic here
        pass

test_post_api_attendance_clock_out_records_clock_out_and_work_hours()