import requests

BASE_URL = "http://localhost:5000/api"


def test_get_api_health_returns_service_status():
    url = f"{BASE_URL}/health"
    try:
        response = requests.get(url, timeout=30)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        data = response.json()
        # Validate presence of expected keys related to service status and uptime in response
        assert isinstance(data, dict), "Response JSON should be a dictionary"
        # The PRD does not specify exact fields in health response, assuming serviceStatus and uptime
        assert "serviceStatus" in data or "status" in data or "uptime" in data, "Expected service status or uptime details in response"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_get_api_health_returns_service_status()