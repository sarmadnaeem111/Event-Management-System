# Event Management System

A web application for managing wedding hall bookings and event services. Built with React.js and Firebase.

## Features

- Admin Dashboard
  - Approve/reject service provider registrations
  - Manage wedding hall bookings
  - View and manage service bookings

- Service Provider Portal
  - Registration with admin approval
  - Service management
  - Booking management

- Customer Portal
  - Browse wedding halls
  - Search and filter services
  - Book wedding halls and services
  - View booking status

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd event-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable:
   - Authentication
   - Firestore Database
   - Storage (optional, for images)

4. Configure Firebase:
   - Create a new file `src/firebase.js`
   - Copy your Firebase configuration from the Firebase Console
   - Replace the placeholder values in the config object

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
  ├── components/         # Reusable components
  ├── pages/             # Page components
  │   ├── admin/        # Admin pages
  │   ├── customer/     # Customer pages
  │   └── serviceProvider/ # Service provider pages
  ├── firebase.js       # Firebase configuration
  ├── App.js           # Main application component
  └── index.js         # Application entry point
```

## Firebase Collections

- `weddingHalls`: Wedding hall information
- `serviceProviders`: Service provider profiles
- `bookings`: Booking records

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 