 HEAD
# Dr. Desai Appointment Booking System

A full-stack web application for managing doctor-patient appointments with role-based access control, medical records management, and real-time appointment tracking.

## 🏥 Features

### Patient Features
- **Registration & Authentication**: Secure patient registration and login
- **Appointment Booking**: Book appointments with available doctors
- **Appointment Management**: View, cancel, and reschedule appointments
- **Medical Profile**: Manage personal information and medical details
- **Vitals Tracking**: Update and track health vitals (weight, height, heart rate)
- **Medical History**: View personal medical records and prescriptions

### Doctor Features
- **Secure Login**: Doctor authentication with specialized credentials
- **Appointment Management**: Accept, reject, reschedule, and complete appointments
- **Patient Records**: View and update patient medical records
- **Prescription Management**: Create and manage patient prescriptions
- **Vitals Monitoring**: Track and update patient vitals
- **Medical History**: Comprehensive patient medical history management

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Material-UI (MUI)** for modern, responsive UI components
- **React Router** for client-side routing
- **React Query** for server state management
- **React Hook Form** for form handling
- **Notistack** for notifications
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication and authorization
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate Limiting** for API protection

## 📁 Project Structure

```
DR_DESAI_FINAL_WEBSITE/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Authentication context
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js Backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API routes
│   ├── config/            # Database configuration
│   └── package.json       # Backend dependencies
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DR_DESAI_FINAL_WEBSITE
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dr_desai_appointments
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```
   
   This will start both the backend server (port 5000) and frontend development server (port 3000).

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Appointments
- `GET /api/appointments/doctors` - Get available doctors
- `POST /api/appointments` - Book appointment (Patient only)
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/:id/status` - Update appointment status (Doctor only)
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `POST /api/medical-records` - Create medical record (Doctor only)
- `GET /api/medical-records/patient/:patientId` - Get patient medical records
- `GET /api/medical-records/:id` - Get specific medical record
- `PUT /api/medical-records/:id` - Update medical record (Doctor only)
- `PUT /api/medical-records/vitals/:patientId` - Update patient vitals
- `GET /api/medical-records/vitals/:patientId` - Get vitals history
- `DELETE /api/medical-records/:id` - Delete medical record (Doctor only)

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "user_id_here",
  "iat": "issued_at_timestamp",
  "exp": "expiration_timestamp"
}
```

### Role-Based Access Control
- **Patient Role**: Can book appointments, view own records, update vitals
- **Doctor Role**: Can manage appointments, create/update medical records, view patient data

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['doctor', 'patient']),
  phone: String,
  // Doctor specific fields
  specialization: String,
  licenseNumber: String,
  experience: Number,
  // Patient specific fields
  age: Number,
  gender: String,
  address: String,
  emergencyContact: Object
}
```

### Appointment Model
```javascript
{
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: User),
  date: Date,
  time: String,
  status: String (enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled']),
  reason: String,
  symptoms: String,
  notes: String,
  prescription: String,
  followUpDate: Date
}
```

### Medical Record Model
```javascript
{
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: User),
  appointment: ObjectId (ref: Appointment),
  vitals: {
    weight: { value: Number, unit: String, date: Date },
    height: { value: Number, unit: String, date: Date },
    heartRate: { value: Number, unit: String, date: Date },
    bloodPressure: { systolic: Number, diastolic: Number, date: Date },
    temperature: { value: Number, unit: String, date: Date }
  },
  diagnosis: String,
  symptoms: [String],
  prescription: {
    medications: [Object],
    notes: String
  },
  treatment: String,
  followUp: Object,
  allergies: [String],
  medicalHistory: [Object],
  notes: String
}
```

## 🎨 UI/UX Features

### Design System
- **Material-UI Theme**: Custom medical-themed color palette
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG compliant components and navigation
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: User-friendly error messages and validation

### Key Components
- **Navigation**: Responsive sidebar with role-based menu items
- **Forms**: Validated input fields with real-time feedback
- **Tables**: Sortable and filterable data tables
- **Cards**: Information display with action buttons
- **Modals**: Confirmation dialogs and form overlays

## 🔧 Development

### Available Scripts

**Root Directory:**
- `npm run dev` - Start both client and server in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install all dependencies

**Server Directory:**
- `npm run dev` - Start server with nodemon
- `npm start` - Start server in production mode

**Client Directory:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- ESLint configuration for code linting
- Prettier for code formatting
- React Query for efficient data fetching
- Error boundaries for graceful error handling

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the application: `npm run build`
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure proxy settings for API calls

### Database Setup
1. Set up MongoDB instance (local or cloud)
2. Configure connection string in environment variables
3. Set up database indexes for optimal performance

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: HTTP security headers
- **Environment Variables**: Secure configuration management

## 📊 Performance Optimization

- **React Query**: Efficient caching and background updates
- **MongoDB Indexing**: Optimized database queries
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed assets and lazy loading
- **Bundle Optimization**: Tree shaking and code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Dr. Desai Appointment Booking System** - Modern healthcare management solution for efficient doctor-patient interactions. 

# Dr.Desai-Website 642b0835da11ca08f78f6c305b86903be83acd61
