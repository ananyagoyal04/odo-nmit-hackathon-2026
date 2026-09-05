import requests

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_get_api_health_returns_service_status():
    url = f"{BASE_URL}/health"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request to /api/health failed: {e}"

test_get_api_health_returns_service_status()