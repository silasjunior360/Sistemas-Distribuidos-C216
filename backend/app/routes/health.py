from fastapi import APIRouter

router = APIRouter(tags=["health"])


# Usada pelo healthcheck do Docker Compose para saber se a API está no ar
@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
