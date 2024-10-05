# How to run the server locally

## Prerequisites
Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v12.x or higher)
- [MySQL](https://dev.mysql.com/downloads/) server

## Instruction
### 1. Clone the Repository

```bash
git clone https://github.com/your-username/express-mysql-server.git
cd express-mysql-server
```

### 2. Install Dependencies

Use npm to install the required dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following environment variables. Replace these values with your actual MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_database
DB_PORT=3306
```

### 4. Create the MySQL Database and Table

Before starting the server, ensure that the MySQL server is running and you have created the required database and table

To do that, you can connect to your MySQL server and run the db.sql file to set up all the necessary database and tables

### 5. Start the Server

Once everything is set up, you can start the server using the following command:

```bash
node index.js
```

If everything is configured correctly, you should see:

```
Connected to the MySQL database.
Server is running on http://localhost:3000
```