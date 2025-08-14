# Overview

This is a full-stack web application for school attendance management built with a modern tech stack. The application serves both administrators and students, providing role-based access to features like attendance tracking, medal systems, and a marketplace for rewards. It's designed as a comprehensive school management platform with a focus on student engagement through gamification elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript, implementing a component-based architecture:

- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React Context for authentication
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

The frontend follows a role-based layout system with separate navigation structures for admin and student users. Authentication state is managed through React Context with localStorage persistence.

## Backend Architecture

The backend uses Express.js as the web server with TypeScript:

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js for REST API endpoints
- **Development**: TSX for TypeScript execution in development
- **Production Build**: esbuild for server bundling

The API follows RESTful conventions with endpoints organized by resource (groups, students, attendance, medals, products, purchases). Authentication is handled through simple session management (suitable for development/demo purposes).

## Data Storage

The application uses PostgreSQL as the primary database with Drizzle ORM:

- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: @neondatabase/serverless for serverless PostgreSQL

The database schema includes tables for users, groups, students, attendance, medals, products, and purchases with proper foreign key relationships.

## Authentication & Authorization

Simple role-based authentication system:

- **Roles**: Admin and Student roles with distinct access patterns
- **Session Management**: Basic email/password authentication with localStorage
- **Route Protection**: Layout components enforce role-based access control

## External Dependencies

- **Database**: Neon serverless PostgreSQL
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation
- **Development**: Replit-specific plugins for development environment integration

The application is structured as a monorepo with shared schema definitions between frontend and backend, ensuring type safety across the full stack.