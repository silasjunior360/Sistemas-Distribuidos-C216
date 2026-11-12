from fastapi import status

URL = "/health"


# Preflight (OPTIONS) que o navegador envia antes de chamar a API
def preflight(client, origin):
    return client.options(
        URL,
        headers={"Origin": origin, "Access-Control-Request-Method": "GET"},
    )


def test_cors_allows_frontend_origin(client):
    response = preflight(client, "http://localhost:5173")

    assert response.status_code == status.HTTP_200_OK
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_rejects_unknown_origin(client):
    response = preflight(client, "http://site-desconhecido.com")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "access-control-allow-origin" not in response.headers
