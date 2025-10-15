# FixItNow Backend API

A robust Node.js/Express backend API for the FixItNow platform with MongoDB integration, JWT authentication, and comprehensive user management.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Dual User Types** - Support for regular users and professionals
- 🛡️ **Security** - Helmet, CORS, rate limiting, and input validation
- 📊 **MongoDB Integration** - Mongoose ODM with schema validation
- ✅ **Input Validation** - Express-validator for request validation
- 🚀 **Modern ES6+** - Latest JavaScript features with ES modules
- 📝 **Comprehensive Logging** - Morgan for HTTP request logging
- 🔧 **Environment Configuration** - Dotenv for environment management

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Configure Environment Variables:**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

#### User Registration
```http
POST /api/auth/signup/user
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword"
}
```

#### Professional Registration
```http
POST /api/auth/signup/professional
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "password": "securepassword",
  "services": ["Plumbing", "Electrical"],
  "experience": 5,
  "city": "Hyderabad",
  "bio": "Experienced professional with 5 years in the field"
}
```

#### User Login
```http
POST /api/auth/login/user
Content-Type: application/json

{
  "identifier": "john@example.com", // email or phone
  "password": "securepassword"
}
```

#### Professional Login
```http
POST /api/auth/login/professional
Content-Type: application/json

{
  "identifier": "jane@example.com", // email or phone
  "password": "securepassword"
}
```

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <your_jwt_token>
```

### Health Check
```http
GET /api/health
```

## Database Schema

### User Model
- Personal information (firstName, lastName, email, phone)
- Authentication (password, userType)
- Verification status (isEmailVerified, isPhoneVerified)
- Profile settings and preferences
- Account status and activity tracking

### Professional Model
- Extends User model with professional-specific fields
- Services offered and experience level
- Location and service area
- Verification and rating system
- Availability and pricing information
- Business details and insurance information

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers and protection
- **Environment Variables**: Sensitive data protection

## Error Handling

The API includes comprehensive error handling for:
- Validation errors with detailed field-level messages
- Authentication and authorization errors
- Database connection and operation errors
- Duplicate key violations
- Invalid ObjectId formats
- JWT token errors

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── server.js        # Main server file
├── .env                 # Environment variables
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
└── package.json        # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRE` | JWT expiration time | No | 7d |
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:8080 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
