# Venn Onboarding Form

A production-ready, multi-step onboarding form built with React, TypeScript, and modern web technologies.

## Overview

This application is an onboarding form where users enter personal and business details:

- Personal Information: First name, last name (max 50 chars each)
- Phone Number: Validated for Canadian numbers only
- Corporation Number: Asynchronously validated via API (9 characters)

## Video Demo

https://www.loom.com/share/1cfea987c9274b878eb6c6b4956a96c0

## Key Features

- Multi-step wizard architecture (extensible for additional steps)
- Comprehensive form validation with real-time error messages
- Data persistence when navigating between steps
- Performance optimized: code splitting, lazy loading, React Query caching
- Accessibility: ARIA labels, keyboard navigation, screen reader support
- Production-ready: environment variables, type-safe, comprehensive tests

## Tech Stack

- React 19 + TypeScript
- Vite
- React Hook Form + Zod
- TanStack Query
- Axios
- Tailwind CSS v4
- Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm/yarn

### Installation

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

### Environment Setup

Create a `.env` file:

```env
VITE_API_BASE_URL=https://fe-hometask-api.qa.vault.tryvault.com
```

## Project Structure

```
src/
├── components/ui/          # Reusable UI primitives
├── features/onboarding/    # Feature module
│   ├── api/               # API service functions
│   ├── components/        # Feature components
│   ├── hooks/             # Custom React hooks
│   ├── schema.ts          # Zod validation schemas
│   └── types/             # TypeScript types
├── lib/                   # Third-party configurations
└── utils/                 # Shared utilities
```

## Architecture

The codebase follows a feature-based architecture where related functionality is grouped together.

### Validation Strategy

Phone Number Validation (separate checks):

1. Format: Must start with `+1` and contain exactly 10 digits
2. Area Code: Must be a valid Canadian area code

Corporation Number Validation:

- Synchronous: Length check (9 characters)
- Asynchronous: API validation with React Query caching (30min staleTime)

### Performance

- Code splitting: Success step is lazy-loaded
- React Query caching: Prevents redundant API calls
- Minimal dependencies: No unnecessary bloat

## Testing

The project uses two testing approaches:

### Unit Tests (Direct Mocking)

- **Location**: `*.test.tsx` files
- **Approach**: Direct function mocking with Vitest (`vi.mock()`)
- **Use Case**: Fast, focused component tests
- **Example**: `OnboardingWizard.test.tsx`, `PersonalDetailsStep.test.tsx`

### Integration Tests (MSW)

- **Location**: `*.integration.test.tsx` files
- **Approach**: MSW (Mock Service Worker) intercepts actual HTTP requests
- **Use Case**: Testing full request/response cycle, axios interceptors, error handling
- **Example**: `OnboardingWizard.integration.test.tsx`

**Why Both?**

- **Unit tests** are fast and test component behavior in isolation
- **Integration tests** are more realistic and test the actual HTTP layer
- Together they provide comprehensive coverage

Run tests with:

```bash
pnpm test          # Watch mode
pnpm test:run      # Single run
```

## API Integration

**Validate Corporation Number** (GET)

```http
GET /corporation-number/{number}
```

**Submit Profile** (POST)

```http
POST /profile-details
Body: { firstName, lastName, phone, corporationNumber }
```

API errors are displayed inline with proper error handling. All errors are typed with Zod schemas.
