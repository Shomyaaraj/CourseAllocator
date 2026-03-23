# VUCA - Course Allocation & Management System

Complete API documentation and working features status for VUCA.

## 🔌 API Endpoints (All Implemented & Working)

### Authentication Endpoints ✓
```
POST   /auth/register              - Register new user
POST   /auth/login                 - User login
POST   /auth/logout                - User logout
GET    /auth/profile/:userId       - Get user profile
PUT    /auth/profile/:userId       - Update profile
```

### Course Management (Admin Only) ✓
```
GET    /api/courses                - Get all courses
GET    /api/courses/:courseId      - Get course details
POST   /api/courses                - Create new course
PUT    /api/courses/:courseId      - Update course
DELETE /api/courses/:courseId      - Delete course
GET    /api/courses/:courseId/stats - Get course statistics
```

### Student Preferences ✓
```
POST   /api/preferences            - Submit course preferences
GET    /api/preferences/:studentId - Get student preferences
PUT    /api/preferences/:id        - Update preferences
DELETE /api/preferences/:id        - Delete preferences
GET    /api/admin/preferences      - Get all preferences (Admin)
```

### Course Allocation (Admin Only) ✓
```
POST   /api/allocation/run         - Run allocation algorithm
GET    /api/allocation/:id         - Get allocation results
GET    /api/allocation/student/:id - Get student allocation
GET    /api/allocation/status      - Allocation status
GET    /api/admin/allocation/history - Allocation history
```

### Reports & Analytics ✓
```
GET    /api/reports/allocation     - Generate allocation report
GET    /api/reports/:id/pdf        - Download PDF report
GET    /api/admin/statistics       - System statistics
GET    /api/admin/dashboard        - Dashboard analytics
```

### User Management (Admin Only) ✓
```
GET    /api/admin/users            - Get all users
GET    /api/admin/users/:userId    - Get specific user
PUT    /api/admin/users/:userId/role - Update user role
DELETE /api/admin/users/:userId    - Delete user
```

### System Settings (Admin Only) ✓
```
GET    /api/settings               - Get system settings
PUT    /api/settings               - Update settings
```

## ✨ Working Features

### ✅ Student Features
- Email/password login & registration
- Personal dashboard with course information
- Submit and manage course preferences
- Drag-and-drop preference ordering
- View course allocation results
- Download results as PDF
- Dark/Light theme toggle
- Mobile-responsive interface

### ✅ Admin Features
- Admin dashboard with system statistics
- Comprehensive course management (CRUD)
- View all student preferences
- Run intelligent allocation algorithm
- Generate allocation reports
- Download reports as PDF
- User role management
- System configuration settings

### ✅ General Features
- Real-time data synchronization (Firestore)
- Role-based access control
- Secure Firebase authentication
- Toast notifications
- Loading states & error handling
- Professional UI design
- Fully responsive layout

## 📊 Project Status
- **Version**: 0.0.1
- **Status**: ✅ Active Development
- **Completion**: 75%
- **Last Updated**: March 23, 2026

## 🛠 Tech Stack
- **Frontend**: React 19.2.4, Vite 8.0.0, Tailwind CSS 4.2.1
- **Styling**: Styled Components 6.3.12, Framer Motion 12.36.0
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Recharts 3.8.0
- **Drag & Drop**: hello-pangea/dnd 18.0.1
- **PDF Export**: jsPDF 4.2.0 + html2canvas

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Git

### Installation
```bash
# Clone repository
git clone <your-repo-url>
cd VUCA

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Add your Firebase credentials to .env.local
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
# ... other variables

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

## 💻 Development Commands
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality
```

## 📚 Complete Documentation
- [INSTALLATION.md](INSTALLATION.md) - Detailed setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines & coding standards
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture & directory layout
- [API_REFERENCE.md](API_REFERENCE.md) - Detailed API documentation with examples
- [SECURITY.md](SECURITY.md) - Security policies & best practices
- [QUICK_START.md](QUICK_START.md) - Quick command reference
- [CHANGELOG.md](CHANGELOG.md) - Version history & roadmap
- [.env.example](.env.example) - Environment variables template

## 🤝 Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development workflow
- Coding standards
- Git commit conventions
- Pull request process

## 📄 License
MIT License - see [LICENSE](LICENSE) for details
