# AI Prompts Template — Learnique (Django + DRF + React)

Copy-paste a template, fill the `[brackets]`, and paste into your AI assistant.
Templates are matched to **this repo's actual stack** (Django 5 + DRF + SimpleJWT
backend, React 19 + Vite + Tailwind frontend) so the generated code fits directly.

---

## 🔧 BACKEND (Django REST Framework)

### Prompt 1 — Create New API Endpoint
```
I'm building a Django 5 + Django REST Framework app (Learnique learning platform).

I need a new API endpoint:
- Path: /api/[resource]/[action]/
- Purpose: [what it should do]
- Input body: [expected JSON]
- Expected response: [JSON output + status code]
- Models involved: [list models and relations]

Please provide:
1. A DRF @api_view or ViewSet @action
2. Serializer if needed
3. Permission checks (follow the pattern in api/views.py: role checks via
   user.role in ('ADMIN','TEACHER','STUDENT') / user.is_staff)
4. Input validation + DRF error responses

Conventions: JWT auth via rest_framework_simplejwt, SQLite/Postgres via
DATABASE_URL, queryset optimization with select_related/prefetch_related.
```

### Prompt 2 — Create a Model + Service Layer
```
I need a new feature for my Django app.

Model: [name] with fields: [field list + types]
Relations: [FKs / M2Ms to existing models]
Operations needed: [list]

Please provide:
1. models.py class following the existing style (e.g. users/models.py)
2. A migration-safe approach (makemigrations steps)
3. Serializer in api/serializers.py
4. ViewSet/endpoint wiring in api/views.py + api/urls.py
5. Any admin.py registration

Include select_related/prefetch_related for the queries the endpoint will run.
```

### Prompt 3 — Fix a Django ORM Query
```
This Django ORM queryset returns wrong/slow results:

[ queryset code ]

Expected: [what it should return]
Models: [paste relevant model definitions and relations]

Please fix it, explain the join/duplicate-row issue, and add the right
select_related/prefetch_related/distinct.
```

## ⚛️ FRONTEND (React 19 + Vite + Tailwind)

### Prompt 4 — Build a Page/Component
```
I'm building a React 19 page for my Learnique app (Vite + Tailwind 4 +
react-router-dom 7 + axios).

Component: [name], route: [path]
Purpose: [what it does]
Features: [list]
API it calls: [endpoint + expected JSON]

Follow repo conventions:
- fetch via `import api from '../api/axiosConfig'`
- auth state via `useAuth()` from context/AuthContext (user, isAdmin, login,
  logout, loading)
- protect the route in App.jsx with <RequireRole role="...">...</RequireRole>
- Tailwind classes incl. dark: variants, loading/error states

Provide the complete component + route wiring.
```

### Prompt 5 — Fix a React Bug
```
My React component misbehaves:

[code]

Symptom: [what happens vs what should happen]
Stack: React 19, react-router-dom 7, Vite, Tailwind 4.

Identify the bug (state/effect/dep-array issue, stale closure, race on
authLoading, etc.), give the corrected code, and explain the cause.
```

## 🗄️ DATABASE

### Prompt 6 — Schema Change
```
Django models for [feature]:

Entities: [A with fields..., B with fields...]
Relations: [A has many B, etc.]
Queries needed: [list]

Provide Django models (BigAutoField, TIME_ZONE aware), migrations plan,
indexes/unique_together, and the serializer + endpoint additions.
```

### Prompt 7 — Optimize a Slow Query
```
This DRF endpoint is slow with [N] rows:

[view + queryset code]

Current response time: [x s]. Target: <500ms.
Give the optimized queryset (select_related/prefetch_related/only/annotate),
any needed indexes/migration, and explain why.
```

## 🔐 SECURITY / AUTH

### Prompt 8 — Add/Change Auth Behavior
```
My Django app uses SimpleJWT: login at /api/auth/login/ (TokenObtainPairView),
refresh at /api/auth/refresh/, profile at /api/auth/me/, register at
/api/auth/register/, dynamic admin claim at /api/auth/admin-setup/ (secret
ADMIN_SETUP_CODE in .env, rate-limited, constant-time compare).

I want to: [e.g. add refresh-token blacklist on logout / email verification /
per-role permission classes]

Follow existing patterns in api/views.py and api/permissions.py; provide
views, urls, settings changes, and tests in the style of api/tests.py.
```

### Prompt 9 — Security Review
```
Review this code for vulnerabilities (IDOR, mass assignment, injection,
missing permission checks, secrets exposure):

[ code ]

Stack: Django 5 + DRF (JWT), React 19 SPA. Give exact fixes + why.
```

## 🧪 TESTING

### Prompt 10 — API Tests
```
Write Django TestCase tests for this endpoint:

[ view code ]

Framework: Django test runner + DRF APIClient (see api/tests.py for style:
BackendApiTests with setUp creating admin/teacher/student users).
Cover: happy path, permission denials per role, validation errors, and
edge cases. Use force_authenticate where appropriate.
```

## 🚀 DEPLOYMENT (Render-style, per build.sh)

### Prompt 11 — Deploy / Fix Deploy
```
My stack: Django backend (gunicorn + whitenoise, build.sh runs check/migrate/
collectstatic), React frontend on [Vercel/Netlify], Postgres via DATABASE_URL.

Task: [initial deploy steps | fix this error: <logs>]

Cover env vars (SECRET_KEY, DEBUG=False, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS,
ADMIN_SETUP_CODE, DATABASE_URL), migrations, static files, and SPA routing
fallback.
```

## 🛠️ DEBUGGING

### Prompt 12 — Debug
```
Symptom: [what's wrong]
Reproduce: [steps]
Console/network errors: [paste]
Code involved: [paste]
Stack: Django 5 + DRF + SimpleJWT | React 19 + Vite + axios (JWT interceptor
with silent refresh).

Find the root cause and give the corrected code.
```

## 💡 How to use
1. Pick the template matching your need. 2. Fill every `[bracket]`.
3. Paste into your AI assistant. 4. Integrate, then run
`python manage.py test` and `npm run build` to verify.
