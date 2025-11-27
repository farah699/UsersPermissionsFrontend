# Users & Permissions Management Dashboard - Frontend

A comprehensive React TypeScript application for managing users, roles, and permissions with modern UI/UX design.

## 🚀 Features

### Core Functionality
- **User Management**: Complete CRUD operations for user accounts
- **Role-Based Access Control (RBAC)**: Comprehensive role and permission management
- **Authentication & Authorization**: JWT-based secure authentication
- **Audit Logging**: Real-time activity tracking and monitoring
- **Dashboard**: Overview of system statistics and recent activities

### Technical Features
- **Modern React Stack**: React 18, TypeScript, Vite
- **State Management**: Zustand for auth state, TanStack Query for server state
- **UI Components**: TailwindCSS with custom design system
- **Form Handling**: React Hook Form with validation
- **Routing**: React Router v6 with protected routes
- **API Integration**: Axios with interceptors and error handling

## 🛠 Technology Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 4.5.0
- **Language**: TypeScript 5.2.2
- **Styling**: TailwindCSS 3.3.5
- **State Management**: 
  - Zustand 4.4.7 (auth state)
  - TanStack Query 5.8.4 (server state)
- **Form Handling**: React Hook Form 7.48.2
- **Routing**: React Router DOM 6.20.1
- **HTTP Client**: Axios 1.6.2
- **Icons**: Heroicons 2.0.18

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Backend server running on http://localhost:3001

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd users-permissions-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Main application header
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Layout.tsx      # Main layout wrapper
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Application pages
│   ├── LoginPage.tsx   # Authentication page
│   ├── DashboardPage.tsx # Main dashboard
│   ├── UsersPage.tsx   # User management
│   ├── RolesPage.tsx   # Role management
│   ├── PermissionsPage.tsx # Permission management
│   ├── AuditPage.tsx   # Audit logs
│   └── ProfilePage.tsx # User profile
├── services/           # API services
│   └── api.ts         # Axios configuration
├── store/             # State management
│   └── authStore.ts   # Authentication store
├── types/             # TypeScript type definitions
│   └── index.ts       # All type definitions
├── App.tsx            # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## 🎨 UI/UX Features

### Design System
- **Consistent Color Palette**: Primary, secondary, success, warning, error colors
- **Typography**: Structured heading and body text styles
- **Spacing**: Consistent margin and padding scales
- **Components**: Reusable buttons, cards, forms, and modals

### User Experience
- **Responsive Design**: Mobile-first approach with breakpoints
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Search & Filtering**: Advanced filtering capabilities
- **Pagination**: Efficient data loading and navigation
- **Toast Notifications**: Success and error feedback

## 📱 Pages Overview

### 1. Dashboard
- System statistics (users, roles, permissions)
- Recent activity timeline
- Quick action buttons
- System status indicators

### 2. Users Management
- **CRUD Operations**: Create, read, update, delete users
- **Search & Filter**: By name, email, status, role
- **Bulk Actions**: Activate/deactivate multiple users
- **Role Assignment**: Assign and manage user roles
- **Status Management**: Toggle active/inactive status

### 3. Roles Management
- **Role CRUD**: Complete role lifecycle management
- **Permission Assignment**: Attach/detach permissions to roles
- **Visual Permission Display**: Card-based permission overview
- **Search & Filter**: By name, description, permissions

### 4. Permissions Management
- **Permission CRUD**: Create, edit, delete permissions
- **Quick Templates**: Pre-defined common permissions
- **Resource-Action Model**: Structured permission format
- **Advanced Filtering**: By resource, action, description

### 5. Audit Logs
- **Activity Tracking**: All user and system activities
- **Advanced Search**: By user, action, resource, date range
- **Export Functionality**: CSV download of audit logs
- **Visual Timeline**: Activity timeline with details
- **IP & Device Tracking**: Security monitoring

## 🔐 Authentication Flow

### Login Process
1. User submits credentials
2. Frontend validates input
3. API authentication request
4. JWT tokens received and stored
5. User redirected to dashboard

### Token Management
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Automatic Refresh**: Transparent token renewal
- **Secure Storage**: Tokens stored in memory and cookies

### Route Protection
- **ProtectedRoute Component**: Wraps authenticated routes
- **Authentication Check**: Validates tokens on page load
- **Automatic Redirect**: Unauthenticated users sent to login

## 🔧 API Integration

### Base Configuration
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptors
- **Authentication**: Automatic token attachment
- **Error Handling**: Global error processing
- **Request Logging**: Development debugging

### Response Interceptors
- **Token Refresh**: Automatic token renewal
- **Error Processing**: Consistent error format
- **Loading State**: Automatic loading indicators

## 📊 State Management

### Authentication Store (Zustand)
```typescript
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}
```

### Server State (TanStack Query)
- **Data Fetching**: Automatic caching and background updates
- **Mutations**: Create, update, delete operations
- **Optimistic Updates**: UI updates before server confirmation
- **Error Recovery**: Automatic retry on failure

## 🎯 Key Components

### UsersPage Features
- **Data Table**: Sortable columns, pagination, search
- **Create Modal**: Form with validation for new users
- **Edit Modal**: Pre-populated form for updates
- **Delete Confirmation**: Safety confirmation modal
- **Status Toggle**: Quick activate/deactivate action

### RolesPage Features
- **Card Layout**: Visual role representation
- **Permission Management**: Checkbox-based permission assignment
- **Search & Filter**: Real-time filtering
- **CRUD Modals**: Create, edit, delete operations

### PermissionsPage Features
- **Grid Layout**: Card-based permission display
- **Quick Templates**: One-click common permission creation
- **Advanced Filtering**: Multi-criteria filtering
- **Resource Grouping**: Logical permission organization

## 🚀 Development Workflow

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality assurance

## 🔒 Security Features

### Client-Side Security
- **Input Validation**: Form validation and sanitization
- **XSS Protection**: Proper HTML encoding
- **CSRF Protection**: Token-based protection
- **Secure Storage**: Secure token handling

### API Security
- **JWT Authentication**: Stateless authentication
- **Role-Based Access**: Permission-based actions
- **Request Validation**: Input validation
- **Rate Limiting**: API abuse protection

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- **Touch-Friendly**: Large touch targets
- **Responsive Navigation**: Collapsible sidebar
- **Mobile Forms**: Optimized form layouts
- **Touch Gestures**: Swipe and tap interactions

## 🧪 Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing for custom hooks
- Utility function testing

### Integration Testing
- API integration tests
- Authentication flow testing
- Route protection testing

### E2E Testing
- User journey testing
- Cross-browser compatibility
- Performance testing

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
- Production API URLs
- Error tracking configuration
- Performance monitoring setup

### Static Hosting
Compatible with:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- Frontend Developer: [Your Name]
- Backend Developer: [Backend Team]
- UI/UX Designer: [Design Team]

## 📞 Support

For support or questions:
- Email: support@example.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

**Built with ❤️ using React, TypeScript, and modern web technologies**