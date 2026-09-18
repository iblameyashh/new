"""Headless behavioral verification against the LIVE dev server (127.0.0.1:8000).

Drives the real API end-to-end with plain urllib and ASSERTS state transitions.
Exits non-zero on any failure.
"""
import json
import os
import time
import urllib.request
import urllib.error
import sys

BASE = "http://127.0.0.1:8000"
CODE = os.environ.get('ADMIN_SETUP_CODE', '')
if not CODE:
    # Fall back to the local backend/.env so no secret lives in this file.
    _env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', '.env')
    if os.path.exists(_env_path):
        with open(_env_path, encoding='utf-8') as _f:
            for _line in _f:
                if _line.strip().startswith('ADMIN_SETUP_CODE='):
                    CODE = _line.split('=', 1)[1].strip()
                    break
if not CODE:
    print('SKIP: set ADMIN_SETUP_CODE (env or backend/.env) to run the admin-setup checks.')
    sys.exit(2)
results = []
UNIQ = str(int(time.time()))  # unique per run so re-runs aren't polluted


def call(method, path, body=None, token=None):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode() or "{}")
        except Exception:
            return e.code, {}


def check(name, cond, detail=""):
    results.append((name, cond, detail))
    print(("PASS  " if cond else "FAIL  ") + name + (f"  [{detail}]" if detail and not cond else ""))


# --- 1. Register a fresh student ------------------------------------------------
email = f"verify_flow_{UNIQ}@t.com"
call("POST", "/api/auth/register/", {
    "email": email, "username": email, "password": "verifypass123",
    "first_name": "Verify", "last_name": "Flow", "role": "STUDENT", "class_level": "Class 5",
})
status, body = call("POST", "/api/auth/login/", {"username": email, "password": "verifypass123"})
check("student login returns JWT pair", status == 200 and "access" in body and "refresh" in body, str(body)[:80])
student_token = body.get("access", "")

status, me = call("GET", "/api/auth/me/", token=student_token)
check("me() shows STUDENT role, is_admin=false", status == 200 and me.get("role") == "STUDENT" and me.get("is_admin") is False, str(me)[:80])

# --- 2. Student is denied owner APIs -------------------------------------------
status, _ = call("GET", "/api/owner/stats/", token=student_token)
check("owner API blocked for student (403)", status == 403, f"got {status}")

# --- 3. Student denied admin-setup with wrong code ------------------------------
status, body = call("POST", "/api/auth/admin-setup/", {"code": "nope", "email": email, "password": "verifypass123"})
check("admin-setup rejects wrong code", status == 400 and body.get("error"), str(body)[:80])

# --- 4. Correct code + correct password promotes the SAME account ---------------
status, body = call("POST", "/api/auth/admin-setup/", {"code": CODE, "email": email, "password": "verifypass123"})
check("admin-setup promotes account (200)", status == 200 and "message" in body, f"{status} {str(body)[:80]}")

status, me = call("GET", "/api/auth/me/", token=student_token)
check("same JWT now resolves as ADMIN", me.get("role") == "ADMIN" and me.get("is_admin") is True, str(me)[:100])

# --- 5. Promoted admin can actually use owner APIs ------------------------------
status, stats = call("GET", "/api/owner/stats/", token=student_token)
check("owner stats API opens for promoted admin", status == 200 and "total_students" in stats, f"{status} {str(stats)[:80]}")

status, students = call("GET", "/api/owner/students/", token=student_token)
check("owner students list opens", status == 200 and isinstance(students, list), f"got {status}")

# --- 6. Login with a WRONG password is rejected ---------------------------------
status, _ = call("POST", "/api/auth/login/", {"username": email, "password": "wrong-password"})
check("wrong password rejected (401)", status == 401, f"got {status}")

# --- 7. Admin-setup with wrong password for existing account is rejected --------
status, body = call("POST", "/api/auth/admin-setup/", {"code": CODE, "email": email, "password": "wrongpass123"})
check("admin-setup rejects wrong password (400)", status == 400, f"got {status}")

# --- 8. Refresh token actually rotates ------------------------------------------
status, login = call("POST", "/api/auth/login/", {"username": email, "password": "verifypass123"})
status, refreshed = call("POST", "/api/auth/refresh/", {"refresh": login.get("refresh", "")})
check("refresh issues a new access token", status == 200 and "access" in refreshed, f"got {status}")

# --- 9. Unauthenticated requests are rejected -----------------------------------
status, _ = call("GET", "/api/auth/me/")
check("me() without token is 401", status == 401, f"got {status}")

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} behavioral checks passed")
sys.exit(1 if failed else 0)
