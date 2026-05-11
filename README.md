# HRFlow - HR Management System

A comprehensive HR management system built with Next.js, Prisma, and PostgreSQL.

## Features

- **Employee Management**: Complete employee profiles and directory
- **Time Tracking**: Automated check-in/check-out system
- **Leave Management**: Streamlined leave requests and approvals
- **Offer Letter System**: Send professional offer letters via email using Resend
- **Analytics & Reports**: Comprehensive workforce insights
- **Role-based Access Control**: Admin, HR, Manager, and Employee roles
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-021
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hrflow"
   JWT_SECRET="your-secret-key-here"
   
   # Resend Email Configuration (for offer letters)
   RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   RESEND_FROM_EMAIL="noreply@yourdomain.com"  # Optional - defaults to onboarding@resend.dev
   ```
   
   See [RESEND_SETUP.md](RESEND_SETUP.md) for detailed email configuration instructions.

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push the schema to your database
   npx prisma db push
   
   # Seed the database with test users
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Test Users

After running the seed script, you can use these test credentials:

- **Admin**: `admin@company.com` / `password123`
- **HR Manager**: `hr@company.com` / `password123`
- **Employee**: `john@company.com` / `password123`

## System Architecture

### Authentication Flow

1. **Login**: Users authenticate via `/api/auth/login` with email/password
2. **JWT Token**: Valid credentials return a JWT token stored in HTTP-only cookies
3. **Session Management**: Client-side state managed via localStorage for UI updates
4. **API Protection**: All protected routes verify JWT tokens via `/api/auth/me`

### Role-based Access Control

- **ADMIN**: Full system access, can manage all users and data
- **HR**: Employee management, leave approvals, reports
- **MANAGER**: Team management, leave approvals for direct reports
- **EMPLOYEE**: Personal profile, check-in/out, leave requests

### Database Schema

- **Users**: Authentication and role management
- **Employees**: Detailed employee information
- **Check-ins**: Time tracking records
- **Leave Requests**: Leave management system
- **Leave Balances**: Annual leave tracking

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Employee Management
- `GET /api/employees` - List employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Time Tracking
- `POST /api/checkin` - Check in/out
- `GET /api/checkin` - Get check-in status
- `GET /api/checkin/all` - Get all check-ins (admin/HR only)

### Leave Management
- `POST /api/leave` - Submit leave request
- `GET /api/leave` - Get leave requests
- `PUT /api/leave/[id]` - Approve/reject leave request
- `GET /api/leave/balance` - Get leave balances

## Development

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma`
2. **API Routes**: Create new endpoints in `app/api/`
3. **UI Components**: Add new pages in `app/dashboard/`
4. **Database Migration**: Run `npx prisma db push` after schema changes

### Code Style

- Use TypeScript for type safety
- Follow Next.js 13+ App Router conventions
- Use Prisma for database operations
- Implement proper error handling and validation

## Security Features

- **Password Hashing**: bcrypt with cost factor 10
- **JWT Tokens**: Secure session management
- **HTTP-only Cookies**: XSS protection
- **Role-based Access**: API endpoint protection
- **Input Validation**: Server-side validation for all inputs

## Deployment

### Production Considerations

1. **Environment Variables**: Set proper production values
2. **Database**: Use production PostgreSQL instance
3. **JWT Secret**: Use strong, unique secret key
4. **HTTPS**: Enable secure connections
5. **Rate Limiting**: Implement API rate limiting

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Support

For issues and questions:
1. Check the documentation
2. Review the code examples
3. Create an issue in the repository

## License

This project is licensed under the MIT License.