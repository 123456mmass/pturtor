# P-Turtor Learning Platform

แพลตฟอร์มการเรียนรู้ออนไลน์ครบวงจรสำหรับคนไทย

## 🚀 Features

### 📚 Course Management
- **Video Courses** - Pre-recorded และ Live streaming
- **PDF/eBooks** - เนื้อหาอ่านประกอบ
- **Quiz & Exam** - ระบบแบบทดสอบ
- **Certificate** - ใบประกาศนียบัตร PDF อัตโนมัติ

### 💳 Payment
- **Stripe** - รับบัตรเครดิต Visa/Mastercard
- **Omise** - รับพร้อมเพย์, โอนธนาคาร, บัตรเดบิตไทย
- **One-time** - ซื้อครั้งเดียวจบ
- **Subscription** - สมัครสมาชิกรายเดือน/รายปี

### 🔐 Authentication
- Email/Password
- Google OAuth
- Line Login (Thai)

### 💬 Community
- **Live Chat** - ห้องแชทถามตอบแบบ Real-time
- **Discussion** - กระทู้ถาม-ตอบรายบทเรียน

## 🏗️ Architecture

```
pturtor/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Student & Instructor dashboard
│   ├── (landing)/         # Landing pages
│   ├── api/               # API routes
│   └── admin/             # Admin panel
├── components/            # React components
├── lib/                   # Utilities
├── prisma/               # Database schema
├── public/               # Static files
└── types/                # TypeScript types
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 |
| Payment | Stripe + Omise |
| Video | Mux |
| Real-time | Socket.io |
| File Storage | UploadThing |

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/pturtor"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
LINE_CHANNEL_ID=""
LINE_CHANNEL_SECRET=""

# Payment
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
OMISE_PUBLIC_KEY=""
OMISE_SECRET_KEY=""

# Video (Mux)
MUX_TOKEN_ID=""
MUX_TOKEN_SECRET=""
MUX_WEBHOOK_SECRET=""

# File Upload
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run development
npm run dev
```

## 📄 License

MIT License
