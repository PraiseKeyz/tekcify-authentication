# Tekcify Authentication System

A professional, production-ready authentication system built with Node.js, TypeScript, Express, and MongoDB. This project implements robust authentication logic, Role-Based Access (RBA), Multi-Factor Authentication (MFA), and email notifications using SMTP (Mailtrap, Google, or similar).

## Features

- User registration and login with JWT authentication
- Role-Based Access (RBA) for route protection (User/Admin)
- Multi-Factor Authentication (MFA) via email
- Password reset and email verification flows
- Secure password hashing (argon2)
- Clean, modular codebase with TypeScript
- API documentation (Postman)
- Professional commit messages and code documentation

## Tech Stack

- Node.js, Express
- TypeScript
- MongoDB & Mongoose
- Argon2 (password hashing)
- JWT (authentication)
- SMTP (Mailtrap/Google for emails)
- ESLint, Prettier (code quality)

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/tekcify_test
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=no-reply@tekcify.com
```

## Usage

1. **Register a new user** using the registration endpoint (see Postman collection).
2. **Check your email** for a verification link and verify your account.
3. **Login** with your email and password. After successful password validation, an MFA code will be sent to your email.
4. **Enter the MFA code** (from your email) to complete the login and receive your JWT token.
5. **Use the JWT token** as a Bearer token in the Authorization header for all protected routes.
6. **Role-based access**: Some routes require admin privileges. Use an admin account to access these routes.
7. **Password reset** and other flows are available and documented in the Postman collection.

> **All API endpoints and flows are fully documented in the provided Postman collection.**

## API Documentation

Access the full API documentation and example requests in the Postman collection:

[Postman Collection](https://documenter.getpostman.com/view/40640896/2sB34ZrjZ5)

## Code Quality

- Lint: `npm run lint`
- Format: `npm run format`
- Type-check: `npm run build`

## License

MIT
