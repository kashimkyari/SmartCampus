# SmartCampus - Educational Institution Management System

## Overview

SmartCampus is a comprehensive educational institution management system with intelligent timetabling and full academic administration capabilities. The system supports multiple educational structures (high schools, universities, technical schools, international schools) and various educational systems (British, American, IB, custom). The application features a guided onboarding process that adapts the system configuration based on institution type and educational framework.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Application Structure
- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **UI Framework**: Tailwind CSS with shadcn/ui components

### Project Structure
The application follows a monorepo structure with clear separation of concerns:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared types and database schema
- Database migrations managed through Drizzle Kit

## Key Components

### Frontend Architecture
- **React Router**: Using wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and theme support
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Authentication Middleware**: JWT token validation for protected routes
- **Database Layer**: Drizzle ORM with type-safe query builder
- **Session Management**: PostgreSQL session store for production scalability

### Database Schema Design
The system uses a flexible, adaptive data model that supports different institution types:

#### Core Entities
- **Users**: System users with role-based access (admin, staff, student)
- **Institutions**: Main institution configuration with type and education system
- **Faculties**: University-level organizational units
- **Departments**: Subject or area-specific divisions
- **Academic Staff**: Faculty and teaching staff management
- **Students**: Student enrollment and academic records
- **Courses**: Academic courses and programs
- **Classrooms**: Physical and virtual learning spaces
- **Time Slots**: Configurable time periods for scheduling
- **Timetable Slots**: Scheduled classes and activities

#### Adaptive Structure
The schema dynamically adapts based on institution type:
- Universities use faculty/department hierarchy
- High schools use grade/year structure
- Technical schools focus on workshop/practical spaces
- International schools support multi-language and diverse curricula

## Data Flow

### Authentication Flow
1. User registration/login through `/api/auth` endpoints
2. JWT token generation and storage in localStorage
3. Token validation middleware for protected API routes
4. User context management through React Context

### Onboarding Flow
1. **Institution Type Selection**: High school, university, technical, or international
2. **Education System Choice**: British, American, IB, or custom framework
3. **Institution Details**: Basic information and configuration
4. **System Configuration**: Feature selection and initial setup
5. **Database Initialization**: Creation of institution-specific structure

### Application Flow
1. **Authentication Check**: Verify user login status
2. **Institution Status**: Check if institution setup is complete
3. **Route Protection**: Redirect to appropriate onboarding or dashboard
4. **Data Fetching**: Use React Query for server state management
5. **Real-time Updates**: Optimistic updates with query invalidation

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL (serverless PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Authentication**: JWT with bcrypt for password hashing
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Build Tools**: Vite for frontend, esbuild for backend bundling

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer
- **ESLint/Prettier**: Code formatting and linting (implied)

### Production Dependencies
- **Session Storage**: connect-pg-simple for PostgreSQL sessions
- **Date Handling**: date-fns for date manipulation
- **Form Validation**: Zod with drizzle-zod integration
- **Development**: Replit-specific development tools and error handling

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: tsx for TypeScript execution in development
- **Database**: Drizzle migrations with `db:push` command
- **Environment Variables**: DATABASE_URL for PostgreSQL connection

### Production Build
- **Frontend**: Vite build process generating static assets
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema management
- **Static Assets**: Built to `dist/public` directory

### Environment Configuration
- **Development**: NODE_ENV=development with detailed logging
- **Production**: NODE_ENV=production with optimized builds
- **Database**: Environment-specific DATABASE_URL configuration
- **Security**: JWT_SECRET for token signing (defaults provided for development)

### Scalability Considerations
- **Database**: PostgreSQL with connection pooling through Neon
- **Session Management**: PostgreSQL-backed sessions for horizontal scaling
- **Static Assets**: Separate serving of built frontend assets
- **API Design**: RESTful design supporting caching and CDN integration