# Event Registration System Backend

## Overview
This project provides the backend API for an event management system that allows organizers to create events, manage tickets, create custom questionnaires, and process payments. Participants can browse events, register, purchase tickets, and complete event-specific questionnaires.

## Prerequisites
Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MySQL](https://dev.mysql.com/downloads/) server
- npm or yarn

## Development Environment Setup
### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Capstone-Backend.git
cd Capstone-Backend
```

### 2. Install Dependencies

Use npm to install the required dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

- Copy the example environment file:

```bash
cp .env.example .env
```

- Update the .env file with your database credentials and other settings:

```
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/event_management_dev"

# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET="your-secret-jwt-key"
REFRESH_TOKEN_SECRET="your-secret-refresh-token-key"
```

### 4. Set up database and sample data

```bash
npm run setup:dev
```

This script will:

- Verify database connection
- Apply database migrations
- Seed the database with sample data for testing

### 5. Start the Server

Once everything is set up, you can start the server using the following command:

```bash
npm run dev
```

If everything is configured correctly, you should see:

```
Connected to the MySQL database.
Server is running on http://localhost:3000
```

## Sample data


## Switching to a new development environment
When switching to a new development environment or after pulling updates, to ensure seamless integration, perform the steps below:
### 1. Update dependencies

``` bash
npm install
```

### 2. Sync database schema and seed data

```bash
npm run db:setup
```

### Reseting the database
If somehow you need to reset the database to a clean state, run
```bash 
npm run db:reset
```
This will drop all tables, reapply migrations, and reseed the database.

(... to be updated)