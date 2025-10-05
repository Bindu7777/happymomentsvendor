# Customer Authentication & Data Management System

This document outlines the implementation of the customer login and data management system for the vendor CRM app.

## Overview

The system allows customers to create accounts, log in, and save their search preferences for quick access to personalized vendor recommendations.

## Database Schema

### Tables Created

1. **customers** - Stores customer account information
2. **customer_search_filters** - Stores saved search preferences

Run the SQL script `customer_database_schema.sql` in your Supabase SQL editor to create these tables.

## Features Implemented

### 1. Customer Authentication
- **Sign Up**: Full name, email, password, gender (optional), mobile number
- **Login**: Email and password authentication
- **Session Management**: Uses localStorage for session persistence
- **Password Security**: Basic validation (6-8 characters)

### 2. Search Filter Management
- **Save Filters**: Customers can save their current search criteria
- **Load Filters**: Quick access to previously saved searches
- **Filter Management**: Update, delete, and apply saved filters
- **Filter Naming**: Custom names for easy identification

### 3. Customer Dashboard
- **Profile Information**: View and manage account details
- **Saved Filters**: Manage all saved search preferences
- **Quick Actions**: Apply filters directly from dashboard

## Components Created

### Pages
- `CustomerSignup.tsx` - Customer registration form
- `CustomerLogin.tsx` - Customer login form
- `CustomerDashboard.tsx` - Customer dashboard with profile and filters

### Context
- `CustomerAuthContext.tsx` - Authentication state management

### Modals
- `SaveFilterModal.tsx` - Save current search as a filter
- `LoadFilterModal.tsx` - Load and apply saved filters

## Routes Added

- `/customer-signup` - Customer registration
- `/customer-login` - Customer login
- `/customer-dashboard` - Customer dashboard

## Integration Points

### SmartRequest Page
- Added save/load filter buttons for logged-in customers
- Integrated with existing search functionality
- Seamless filter application

### Header Component
- Updated to show customer authentication status
- Customer dropdown menu with dashboard access
- Conditional rendering based on login state

## Usage

### For Customers
1. **Sign Up**: Visit `/customer-signup` to create an account
2. **Login**: Use `/customer-login` to access your account
3. **Save Filters**: While searching, click "Save Current Filter" to save preferences
4. **Load Filters**: Click "Load Saved Filter" to apply previous searches
5. **Dashboard**: Access `/customer-dashboard` to manage your account and filters

### For Developers
1. **Database Setup**: Run the SQL schema in Supabase
2. **Environment**: Ensure Supabase credentials are configured
3. **Context Usage**: Use `useCustomerAuth()` hook in components
4. **Filter Data**: Access current search data via `getCurrentFilterData()`

## Security Notes

- Passwords are currently base64 encoded (demo purposes)
- In production, implement proper password hashing (bcrypt)
- Row Level Security (RLS) policies are configured
- Customer data is isolated by customer ID

## Future Enhancements

- Email verification for signup
- Password reset functionality
- Advanced filter sharing between customers
- Customer preferences and recommendations
- Integration with vendor booking system

## File Structure

```
src/
├── contexts/
│   └── CustomerAuthContext.tsx
├── pages/
│   ├── CustomerSignup.tsx
│   ├── CustomerLogin.tsx
│   └── CustomerDashboard.tsx
├── components/
│   ├── SaveFilterModal.tsx
│   └── LoadFilterModal.tsx
└── customer_database_schema.sql
```

## Testing

1. Create a customer account via `/customer-signup`
2. Login via `/customer-login`
3. Perform a search on `/smart-request`
4. Save the search filter
5. Load the saved filter
6. Access dashboard to manage filters

The system is now ready for customer use and can be extended with additional features as needed.
