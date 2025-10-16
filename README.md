# SmartGrip - Grip Strength Training App

A minimal but polished React Native app that lets users track grip and functional strength activities, store their data securely, and visualize progress.

## Tech Stack

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Firebase (Authentication + Firestore)
- **Navigation**: React Navigation
- **Charts**: react-native-chart-kit
- **Storage**: AsyncStorage (offline caching)

## Core Features

1. **Auth & User accounts** - Anonymous sign in through Firebase
2. **Activities** - Hang Activity, Farmer Walk Activity, Single Input
3. **History & Graphs** - Previous sessions with line/bar charts
4. **Storage** - Cloud DB per user with local caching for offline mode
5. **UI** - Clean 3-tab layout (Activities | History | Profile)

## Development Guidelines

### Code Quality Standards

- **Clean code and easy to read** - Nothing superfluous
- **Domain Driven Design** - Organize code by business domains
- **Clear components** - Easy to read, single responsibility
- **Separation of concerns** - No business logic in UI components
- **Type extraction** - Types in their own files, organized by domain
- **Short files** - No files with hundreds of lines of code
- **Maintainable** - Easy for experienced developers to modify

### Architecture Principles

- **Performance** - Use React.memo() for expensive components, proper loading states
- **Error Handling** - Implement error boundaries and graceful Firebase error handling
- **Accessibility** - Proper labels, good contrast, 44px+ touch targets
- **Security** - Validate inputs, use Firebase security rules
- **State Management** - Minimal local state, React Query for server state
- **Code Organization** - Barrel exports, consistent naming, feature folders

## Development Steps

### Phase 1: Foundation Setup

1. **Initialize Expo project** with TypeScript and configure development environment ✅
2. **Configure Firebase** project with Authentication and Firestore database ✅
3. **Set up React Navigation** with 3-tab layout (Activities | History | Profile) ✅

### Phase 2: Authentication & Core Infrastructure

6. **Implement Firebase anonymous authentication** with user management ✅
7. **Set up Firebase Firestore integration** with local AsyncStorage caching ✅

### Phase 3: Activity Implementation

8. **Build Activity selection screen** with Hang, Farmer Walk, and Single Input options ✅
9. **Create Hang Activity** with countdown timer and progress visualization ✅
10. **Build Farmer Walk Activity** with distance and weight input forms ✅
11. **Create Single Input screen** for manual hang time and dynamometer entries ✅

### Phase 4: Data & History

12. **Build History tab** with Activity list and progress visualization ✅
13. **Add line/bar charts** for progress tracking using react-native-chart-kit ✅

### Phase 5: Profile & Polish

14. **Build Profile tab** with user info, settings, and about section
15. **Add push notifications** for Activity reminders and streak tracking
16. **Implement offline support** with data caching and sync when connection restored ✅
17. **Apply final UI polish** - animations, consistent design system

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
│   ├── auth.ts
│   ├── activities.ts
│   └── user.ts
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── constants/          # App constants and configuration
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Firebase project
4. Start development server: `npm start`

## Design Philosophy

- **Simple and straightforward** - Users should understand the process easily
- **Minimal reading** - Visual cues over text instructions
- **Dark mode aesthetic** - Clean, high-contrast design
- **Large touch targets** - Easy interaction during workouts
- **One action per screen** - No confusion about next steps
