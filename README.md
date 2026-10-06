# Via Tomitana – V5

## Ce include
- Login / Sign up cu email + parolă
- Login / Sign up cu Google
- Sincronizare Google OAuth -> backend (`/api/auth/oauth`)
- Favorite + programări pentru obiective și trasee
- Butoane de **favorite** și **programare** pe fiecare pagină de obiectiv
- Dashboard admin:
  - vede toate programările turiștilor
  - adaugă / editează / șterge obiective
- Hartă cu filtre pe categorii
- Obiective extinse din județul Constanța

## Backend
```powershell
cd backend
py -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Dacă ai rulat o versiune anterioară, șterge:
`backend/viatomitana.db`

Admin:
- email: `admin@viatomitana.local`
- parolă: `admin123`

## Frontend
```powershell
cd frontend
npm install
npm run dev
```

## Google login
Copiază `frontend/.env.example` în `frontend/.env.local` și completează:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=un-secret-lung
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
