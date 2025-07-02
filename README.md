# 🚀 ClassBoom - Education Management That Sparks Joy

<div align="center">
  <img src="public/classboom-logo.svg" alt="ClassBoom Logo" width="200" />
  
  **ClassBoom** is a revolutionary School Management SaaS platform that transforms how educational institutions operate.
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

## 🎉 Project Status

**Authentication System: COMPLETE!** ✅

We've successfully implemented a full authentication flow with email verification, beautiful animations, and a professional dashboard. The multi-tenant architecture is working perfectly!

## ✨ Features

### Completed ✅
- 🔐 **Complete Authentication System** - Email signup with verification, secure login/logout
- 🏫 **Multi-tenant Architecture** - Each school gets its own isolated PostgreSQL schema
- 📊 **Professional Dashboard** - Statistics, quick actions, and user management
- 🎨 **Beautiful Animations** - Framer Motion throughout with spring physics
- 📱 **Mobile-first Design** - Fully responsive on all devices
- 🎯 **Protected Routes** - Automatic authentication checks

### In Development 🚧
- 👨‍🎓 **Student Management** - Add, edit, and track students
- 📚 **Class Scheduling** - Create and manage class schedules
- 💳 **Payment Processing** - Subscriptions and payment tracking
- 💬 **Communication Hub** - In-app messaging and notifications
- 📊 **Analytics & Reports** - Detailed insights and reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/a7mdelbanna/classboom.git
   cd classboom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Go to your Supabase SQL Editor
   - Run the migration: `supabase/setup-classboom.sql`

5. **Configure Authentication**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Email provider
   - Turn ON "Confirm email" for security

6. **Start Development**
   ```bash
   npm run dev
   ```
   
   Visit `http://localhost:5173` and create your first school! 🎉

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v3, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Routing**: React Router v6
- **State**: Context API (Zustand coming soon)
- **Forms**: Native forms (React Hook Form planned)

## 📁 Project Structure

```
classboom/
├── src/
│   ├── components/        # Shared UI components
│   │   └── ProtectedRoute.tsx
│   ├── features/          # Feature modules
│   │   ├── auth/         # ✅ Authentication (COMPLETE)
│   │   │   ├── context/
│   │   │   └── pages/
│   │   ├── dashboard/    # ✅ Dashboard (COMPLETE)
│   │   ├── students/     # 🚧 Student management
│   │   ├── scheduling/   # 🚧 Class scheduling
│   │   └── payments/     # 🚧 Payment processing
│   ├── lib/              # Configurations
│   │   └── supabase.ts
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
├── supabase/             # Database migrations
└── scripts/              # Utility scripts
```

## 📊 Database Architecture

ClassBoom uses a powerful multi-tenant architecture:

```sql
public (shared)
├── schools              # School registry
├── subscription_plans   # Available plans
└── auth.users          # Supabase auth

school_[uuid] (per school)
├── users               # School users
├── students            # Student records
├── courses             # Available courses
├── sessions            # Class sessions
└── payments            # Payment records
```

Each school's data is completely isolated for security and performance.

## 🎨 Design System

- **Colors**: Orange (primary) & Blue (secondary)
- **Animations**: Spring physics with Framer Motion
- **Components**: Glassmorphism with backdrop blur
- **Typography**: Inter font family
- **Icons**: Emoji icons for quick recognition

## 📝 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run verify:setup     # Verify database connection
npm run claude:startup   # Quick status check
npm run claude:status    # Detailed project status
```

## 🤝 Contributing

We love contributions! Here's how to help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit using conventional commits (`feat:`, `fix:`, etc.)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

1. **"Email invalid" error during signup**
   - Enable email confirmations in Supabase Dashboard
   - Authentication → Configuration → Enable "Confirm email"

2. **Cannot connect to localhost:5173**
   - Make sure you're in the project directory
   - Run `npm run dev` and keep the terminal open

3. **Database connection failed**
   - Check your `.env` file has correct values
   - Verify Supabase project is active

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with ❤️ by [Ahmed Elbanna](https://github.com/a7mdelbanna)
- Powered by [Supabase](https://supabase.com)
- Beautiful animations by [Framer Motion](https://www.framer.com/motion/)
- Styled with [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

Need help? Reach out!

- 📧 Email: support@classboom.com
- 🐛 Issues: [GitHub Issues](https://github.com/a7mdelbanna/classboom/issues)
- 💬 Discord: [Join our community](https://discord.gg/classboom)

---

<div align="center">
  <h3>🎓 ClassBoom - Making School Management Delightful! ✨</h3>
  
  If you like this project, please give it a ⭐!
</div>