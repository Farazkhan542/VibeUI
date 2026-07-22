import os
from fastapi import Header, HTTPException
from supabase import create_client, Client

_admin_client: Client | None = None


def get_admin_client() -> Client:
    global _admin_client
    if _admin_client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. "
                "Add them to backend/.env and restart the server."
            )
        _admin_client = create_client(url, key)
    return _admin_client


async def get_current_user_id(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        result = get_admin_client().auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    if not result or not result.user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return result.user.id
