# Zulia TCG Community

Welcome to the Zulia TCG Community project! This application serves as a platform for managing and engaging with various trading card games (TCGs) in a community setting. Below are the details regarding the project structure, setup instructions, and usage guidelines.

## Project Structure

The project is organized into several key directories and files:

- **app/**: Contains the main application files, including admin pages and API routes.
  - **admin/**: Admin-specific pages for managing the community.
    - **login/**: Login page for administrators.
    - **dashboard/**: Overview of community activities and metrics.
    - **tournaments/**: Manage tournament details.
    - **decks/**: Manage deck information.
    - **news/**: Post updates and announcements.
    - **store/**: Handle items for sale or community resources.
    - **community/**: Manage community interactions.
  - **api/**: API routes for authentication and other functionalities.
  
- **components/**: Reusable components for the application.
  - **admin-sidebar.tsx**: Sidebar navigation for the admin interface.
  - **admin-header.tsx**: Header component for the admin interface.
  - **admin/**: Form components for managing tournaments, decks, news, store items, and community interactions.

- **lib/**: Utility files for authentication, database handling, and permissions management.

- **prisma/**: Database schema definition for Prisma.

- **middleware.ts**: Middleware functions for handling requests.

- **package.json**: Project dependencies and scripts.

- **next.config.ts**: Configuration settings for the Next.js application.

- **tsconfig.json**: TypeScript configuration.

- **.env.example**: Example environment variables for the application.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd zulia-tcg-community
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Copy the `.env.example` file to `.env` and fill in the required variables, such as database connection strings.

4. **Run Database Migrations**:
   Ensure you have Prisma set up and run the migrations to create the database schema.
   ```bash
   npx prisma migrate dev
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage Guidelines

- **Admin Access**: Only administrators can log in to manage the community. Use the `/admin/login` route to access the login page.
- **Dashboard**: Once logged in, you will be directed to the dashboard where you can view community metrics and activities.
- **Manage Content**: Use the respective sections (Tournaments, Decks, News, Store, Community) to manage the content of the community.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to improve the project.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.