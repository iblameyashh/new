# Learnique Backend

Django REST API backend for Learnique.

## Local setup

```bash
cd backend
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py check
python manage.py createsuperuser
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`
Admin: `http://127.0.0.1:8000/admin/`

## Demo data

```bash
python seed.py
```

## Main API endpoints

- `/api/auth/login/`
- `/api/auth/refresh/`
- `/api/auth/register/`
- `/api/auth/me/`
- `/api/courses/`
- `/api/teachers/`
- `/api/students/`
- `/api/subjects/`
- `/api/classes/`
- `/api/enrollments/`
- `/api/reviews/`
- `/api/conversations/`
- `/api/messages/`
- `/api/ai/chat/`
- `/api/courses/<id>/modules/`
- `/api/courses/<id>/assignments/`

## Production / Render

Set these environment variables in the hosting provider:

- `DEBUG=False`
- `SECRET_KEY=<strong-random-secret>`
- `ALLOWED_HOSTS=<backend-host>`
- `DATABASE_URL=<postgres-url>`
- `CORS_ALLOWED_ORIGINS=https://<frontend-domain>`
- `CSRF_TRUSTED_ORIGINS=https://<frontend-domain>`
- `AI_API_KEY=<secret>` (optional until AI is configured)
- `AI_MODEL=<model-name>`

Build command:

```bash
./build.sh
```

Start command:

```bash
gunicorn config.wsgi:application
```

Do not commit `.env` or real secrets.


## Recommended local setup

Use a virtual environment before running Django commands. Do not rely on globally installed Django/DRF packages.

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The project pins Django to the 5.2 LTS-compatible range because some older Django REST Framework releases are incompatible with Django 6.x. If you see an error such as `cannot import name 'cc_delim_re' from django.utils.cache`, you are using a mismatched/global Django installation; activate the project virtual environment and reinstall the requirements.
