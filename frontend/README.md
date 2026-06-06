# Oxford CRM — Frontend

Zamonaviy, animatsiyali frontend (React + Vite + Tailwind + Framer Motion) Oxford CRM Django API uchun.

## Texnologiyalar

- **React 18/19** + **Vite** — tez dev muhiti
- **Tailwind CSS** — dizayn tizimi (dark + glassmorphism)
- **Framer Motion** — silliq animatsiyalar
- **React Router** — sahifa marshrutlari
- **Axios** — API bilan ishlash (JWT, avtomatik token yangilash)
- **Recharts** — statistika grafiklari
- **Lucide React** — ikonkalar
- **React Hot Toast** — bildirishnomalar

## Imkoniyatlar

- 🔐 JWT autentifikatsiya (access/refresh, avtomatik yangilash)
- 🎭 Rol asosida menyu va ruxsatlar (admin / manager / teacher / parent)
- 📊 Animatsiyali statistika kartalari va grafiklar (Dashboard)
- 👨‍🎓 O'quvchilar — CRUD, qidiruv
- 👩‍🏫 O'qituvchilar — CRUD
- 📚 Guruhlar — kartochka ko'rinishi, o'quvchi qo'shish
- ✅ Davomat — filtrlash + bulk davomat olish
- 💳 To'lovlar — yaratish, tasdiqlash/rad etish
- 👥 Foydalanuvchilar boshqaruvi (admin)

## Ishga tushirish

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` (yoki band bo'lsa keyingi port) da ochiladi.

### Backend bilan ulanish

Vite `/api` so'rovlarini `http://localhost:8000` (Django) ga proxy qiladi.
Backend ishga tushgan bo'lishi kerak:

```bash
# loyiha ildizida
python manage.py runserver
```

Boshqa backend manzili kerak bo'lsa, `vite.config.js` dagi `proxy.target` ni o'zgartiring.

## Build

```bash
npm run build      # dist/ papkasiga production build
npm run preview    # build'ni lokal ko'rish
```

## Tuzilma

```
src/
  api/            # axios client + endpoint xizmatlari
  components/
    layout/       # Sidebar, Topbar, DashboardLayout
    ui/           # qayta ishlatiladigan UI (Modal, StatCard, DataTable, ...)
  context/        # AuthContext
  hooks/          # useFetch
  pages/          # Login, Dashboard, Students, Teachers, Groups, Attendance, Payments, Users
```
