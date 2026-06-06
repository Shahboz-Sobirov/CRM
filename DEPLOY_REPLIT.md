# Replit'da Deploy qilish — Oxford CRM

Bu loyiha **bitta server** sifatida ishlaydi: Django backend ham API'ni, ham build qilingan React frontend'ni serve qiladi.

## 1. Loyihani Replit'ga yuklash

1. [replit.com](https://replit.com) ga kiring
2. **Create Repl** → **Import from ZIP** (yoki GitHub'dan import)
3. Bu zip faylni yuklang

Replit avtomatik `python-3.11` va `nodejs-20` muhitlarini o'rnatadi (`.replit` va `replit.nix` orqali).

## 2. Maxfiy sozlamalar (Secrets)

Replit'da chap paneldagi **Secrets** (🔒) bo'limiga quyidagilarni qo'shing:

| Kalit | Qiymat |
|-------|--------|
| `SECRET_KEY` | uzun tasodifiy satr (50+ belgi) |
| `DEBUG` | `False` |

> SECRET_KEY yaratish uchun: `python -c "import secrets; print(secrets.token_urlsafe(64))"`

Qolgan sozlamalar standart qiymatlar bilan ishlaydi (SQLite bazasi, Replit domenlari).

## 3. Ishga tushirish

**Run** tugmasini bosing. Birinchi marta:
- frontend build qilinadi (`npm install` + `npm run build`)
- static fayllar yig'iladi
- migratsiyalar qo'llanadi
- gunicorn server ishga tushadi

Keyin **Deploy** tugmasi orqali doimiy URL olishingiz mumkin (`build.sh` build, `start.sh` ishga tushiradi).

## 4. Admin foydalanuvchi yaratish

Replit **Shell** bo'limida:

```bash
python manage.py createsuperuser
```

Telefon raqami (`+998...`), ism va parol so'raydi. Shu telefon + parol bilan frontend'ga kirasiz.

## 5. Manzillar

| Sahifa | URL |
|--------|-----|
| Frontend (CRM) | `/` |
| Admin panel | `/admin/` |
| API hujjatlari (Swagger) | `/api/swagger/` |
| API ildizi | `/api/` |

---

## PostgreSQL'ga o'tish (ixtiyoriy)

Standart holda SQLite ishlatiladi (hech narsa sozlash shart emas).
PostgreSQL kerak bo'lsa, Secrets'ga qo'shing:

```
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=...
DATABASE_USER=...
DATABASE_PASSWORD=...
DATABASE_HOST=...
DATABASE_PORT=5432
```

---

## Lokal ishga tushirish (Replit'siz)

```bash
# Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (alohida terminalda, dev rejimi)
cd frontend
npm install
npm run dev
```

Dev rejimida frontend `http://localhost:5173`, backend `http://localhost:8000` da ishlaydi (Vite proxy `/api` ni backendga yo'naltiradi).
