# Introduction

Networking Project Backend

## Project Structure

```
src/
├── controllers/         # Handle API logic, call services
├── middlewares/         # Express middlewares (authentication, error handling, etc.)
├── models/              # Define schema/data models (ORM or plain)
├── routes/              # Define endpoints and map to corresponding controllers
├── services/            # Contain business logic
├── sockets/             # Handle WebSocket connections and logic (e.g., Socket.IO)
├── config/              # Configuration files for the server, DB, environment, etc.
├── shared/
│   ├── constants/       # Common constants used throughout the project
│   └── utils/           # Utility functions (helper functions)
├── guiline.txt          # Internal notes or project guidelines
├── index.ts             # Entry point to start the application
└── type.d.ts            # Define custom types for TypeScript

```

## TechStack

### Core

- NodeJS 18
- TypeScript 5.8.3
- tsc-alias 1.8.16
- socket.io

### Tooling & Development

- Nodemon 3.1.10
- Rimraf 5.0.10

### Linting & Formatting

- Eslint 9.31.0
- Prettier 3.6.2
- TypeScript Eslint 8.38.0
- eslint-config-prettier 10.1.8
- eslint-plugin-prettier 5.5.3

### Enviroment Configuration

- dotenv

## npm scripts

- `npm run dev`: Run the application in development mode with `nodemon`
- `npm run build`: Clear the `dist` directory, compile TypeScript, and handle path aliases with `tsc-alias`
- `npm start`: Start the application from the `dist` directory (production mode)
- `npm run lint`: Check for code errors and style issues with `ESLint`
- `npm run lint:fix`: Automatically fix fixable `ESLint`errors
- `npm run prettier`: Check source code formatting based on `Prettier` configuration
- `npm run prettier:fix`: Format all source code according to the `Prettier` standard