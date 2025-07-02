# 🚀 ClassBoom - Education Management That Sparks Joy

<div align="center">
  <img src="public/classboom-logo.svg" alt="ClassBoom Logo" width="200" />
  
  **ClassBoom** is a revolutionary School Management SaaS platform that transforms how educational institutions operate.
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

## ✨ Features

- 🏫 **Multi-tenant Architecture** - Each school gets its own isolated PostgreSQL schema
- ⚡ **Real-time Everything** - Live updates across all users without refreshing
- 🎨 **Beautiful by Design** - 10 pre-built themes with delightful animations
- 📱 **Mobile-first** - Responsive and touch-optimized for all devices
- 💬 **Communication Hub** - In-app chat and WhatsApp integration
- 📊 **Analytics Dashboard** - Real-time insights and reporting
- 💳 **Flexible Payments** - Subscriptions, one-time payments, and trials
- 🔒 **Enterprise Security** - JWT auth, RLS policies, and data encryption

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion + Lottie

## 📁 Project Structure

```
classboom/
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-based modules
│   │   ├── auth/       # Authentication
│   │   ├── dashboard/  # Dashboard & analytics
│   │   ├── students/   # Student management
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # External library configs
│   ├── store/          # Global state management
│   ├── styles/         # Global styles and themes
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions
├── documentation/      # Detailed docs
└── public/            # Static assets
```

## 🎯 Target Users

ClassBoom is designed for:
- 🎓 Private tutoring centers
- 🗣️ Language schools
- 🎵 Music schools
- 🎨 Art schools
- 📚 Small to medium educational institutions
- 👨‍🏫 Individual tutors scaling their business

## 🌟 Key Differentiators

Unlike traditional enterprise software, ClassBoom offers:
- **Consumer-grade UX** - Beautiful, intuitive, and delightful to use
- **True Multi-tenancy** - Complete data isolation per school
- **Developer-friendly** - Clean APIs and comprehensive documentation
- **Performance-first** - 60fps animations and optimistic updates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

ClassBoom is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://docs.classboom.com)
- [API Reference](https://api.classboom.com)
- [Support](https://support.classboom.com)

---

<div align="center">
  Made with ❤️ by the ClassBoom Team
  
  **ClassBoom** - Education Management That Sparks Joy
</div>
