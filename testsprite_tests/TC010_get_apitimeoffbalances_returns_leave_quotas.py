import requests

BASE_URL = "http://localhost:5000/api"
LOGIN_ENDPOINT = "/auth/login"
TIMEOFF_BALANCES_ENDPOINT = "/timeoff/balances"
TIMEOUT = 30

SUPER_ADMIN_CREDENTIALS = {
    "identifier": "OI220001",
    "password": "Password@123"
}

def test_get_timeoff_balances_returns_leave_quotas():
    # Authenticate as Employee (since leave balances are for employees)
    auth_payload = {
        "identifier": "OI220003",
        "password": "Password@123"
    }
    try:
        login_resp = requests.post(f"{BASE_URL}{LOGIN_ENDPOINT}", json=auth_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        token = login_json.get("token")
        assert token, "No token found in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        balances_resp = requests.get(f"{BASE_URL}{TIMEOFF_BALANCES_ENDPOINT}", headers=headers, timeout=TIMEOUT)
        assert balances_resp.status_code == 200, f"Expected 200 but got {balances_resp.status_code}"
        balances_json = balances_resp.json()
        # Check for keys indicating remaining PTO and sick leave quotas
        assert "remainingPTO" in balances_json or "pto" in balances_json, "Remaining PTO quota not found in response"
        assert "remainingSick" in balances_json or "sickLeave" in balances_json, "Remaining Sick Leave quota not found in response"

    except requests.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}")

test_get_timeoff_balances_returns_leave_quotas()