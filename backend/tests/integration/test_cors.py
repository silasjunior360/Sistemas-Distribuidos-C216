from fastapi import status

BASE_URL = "/api/v1/tasks"


# Preflight (OPTIONS) que o navegador envia antes do POST do frontend
def preflight(client, origin):
    return client.options(
        BASE_URL,
        headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
    )


def test_cors_allows_frontend_origin(client):
    response = preflight(client, "http://localhost:5173")

    assert response.status_code == status.HTTP_200_OK
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_rejects_unknown_origin(client):
    response = preflight(client, "http://site-desconhecido.com")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "access-control-allow-origin" not in response.headers
