# Chatbot App

A modern, full-stack chatbot application built with React, TypeScript, Nhost, and Hasura GraphQL.

## 🚀 Current Status

### ✅ Completed Features
- **Authentication System**: Complete email sign-up/sign-in with Nhost Auth
- **Database Schema**: PostgreSQL tables with Row-Level Security
- **GraphQL Operations**: Queries, mutations, and real-time subscriptions
- **Premium UI**: Beautiful authentication interface with responsive design
- **Type Safety**: Full TypeScript integration throughout

### 🚧 In Progress
- **Chat Interface**: Building the main chat components
- **AI Integration**: Setting up n8n workflows and Hasura Actions

### 📋 Upcoming
- **Real-time Chat**: Live messaging with WebSocket subscriptions
- **Bot Responses**: AI-powered chatbot integration
- **Advanced Features**: Message editing, chat management, etc.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Nhost (PostgreSQL + Auth), Hasura GraphQL
- **Real-time**: GraphQL Subscriptions via WebSocket
- **AI**: n8n workflows + OpenRouter API
- **Deployment**: Netlify

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment
```bash
npm run setup
```
This will guide you through setting up your Nhost project details.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Set up Backend
1. Create a Nhost project at [nhost.io](https://nhost.io)
2. Run the database migration: `database/migrations/init_database.sql`
3. Configure Hasura permissions using: `database/hasura/HASURA_SETUP.md`

## 📦 Deployment

### Deploy to Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set the environment variables from your `.env` file
4. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Core libraries (Apollo, Nhost)
├── graphql/            # GraphQL schemas and types
├── utils/              # Utility functions
├── constants/          # App constants
└── types/              # TypeScript type definitions

database/
├── migrations/         # Database schema migrations
└── hasura/            # Hasura configuration

scripts/               # Setup and utility scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run setup` - Interactive environment setup

## 🌟 Features

### Authentication
- Email-based sign-up and sign-in
- JWT token management
- Protected routes
- Beautiful, responsive UI

### Database
- PostgreSQL with Row-Level Security
- Optimized indexes and relationships
- Real-time subscriptions ready

### GraphQL
- Type-safe operations
- Real-time subscriptions
- Optimistic updates
- Advanced caching

### UI/UX
- Premium design with Tailwind CSS
- Responsive layout
- Loading states and error handling
- Accessibility features

## 🤝 Contributing

This project follows a spec-driven development approach. Check the `.kiro/specs/` directory for detailed requirements and implementation plans.

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to deploy and continue building!** 🚀

The foundation is solid - authentication works, database is configured, and GraphQL operations are ready. Perfect time to deploy and continue building the chat interface iteratively.