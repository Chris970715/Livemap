"""
Unit tests for the /health endpoint (polled by Render and UptimeRobot).
"""

from fastapi.testclient import TestClient

from app.main import app

# No context manager: the lifespan (and its news scanner) doesn't start
client = TestClient(app)


class TestHealthEndpoint:
    def test_should_answer_get_with_status(self):
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_should_answer_head_without_body_for_uptime_monitors(self):
        response = client.head("/health")

        assert response.status_code == 200
        assert response.content == b""

    def test_should_list_health_once_in_openapi(self):
        operations = client.get("/openapi.json").json()["paths"]["/health"]

        assert list(operations) == ["get"]
