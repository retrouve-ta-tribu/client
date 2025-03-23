# Retrouve Ta Tribu - Find Your Tribe

## Description
This is a [Vite](https://vitejs.dev/) project that provides a real-time location-sharing application designed to help groups of people find each other. The application allows users to create groups, share their location with group members, set points of interest, and communicate through a chat system.

## Getting Started

### Prerequisites
* IDE used: PhpStorm 2024.2 or WebStorm 2024.2
* npm 10.2+ [official doc](https://docs.npmjs.com/try-the-latest-stable-version-of-npm)
* node v21+ [official doc](https://nodejs.org/en/download)
* git version 2.39+ [official doc](https://git-scm.com/)
* Device with location and orientation sensors (for full feature set)
* Modern browser with support for Geolocation API and orientation events

### Run the project
#### Client
```shell
cd client
npm install
npm run dev
```

#### Server
```shell
cd server
npm install
npm run dev
```

#### WebSocket Relay
```shell
cd websocket-relay
npm install
npm run start
```

## Deployment
### Build the client
```shell
cd client
npm run build
```
This will generate static files in the `dist` folder.
You can then deploy these files to any web server.

### Deploy the server and websocket relay
The server and websocket relay components can be deployed to any Node.js hosting environment.

## Collaborate
### Directory structure
```shell
├───client                  # Frontend React application
│   ├───src                 # Source code
│   │   ├───components      # Reusable UI components
│   │   ├───hooks           # Custom React hooks
│   │   ├───pages           # Page components
│   │   ├───services        # Services for external communication and business logic
│   │   ├───shaders         # WebGL shaders
│   │   ├───styles          # CSS and styling files
│   │   └───utils           # Utility functions and helpers
│   ├───doc                 # Documentation
│   └───public              # Static assets
├───server                  # Backend API server
│   └───src                 # Server source code
└───websocket-relay         # Real-time communication server
```

### Environment Variables
The application uses environment variables for configuration. Create `.env` files in each directory:

#### Client (.env)
```
VITE_SOCKET_SERVER_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Server (.env)
```
PORT=3000
MONGODB_URI=your-mongodb-connection-string
```

#### WebSocket Relay (.env)
```
PORT=3001
```

### Workflow
* We use [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
* Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages
* When creating a new feature, name the branch `feature/RTT-XX-NameOfTheFeature`
* Before merging a feature into develop, the code should be reviewed by at least one other person
* Issues are tracked in the project's GitHub issues page

## Core Features
* **Location Sharing**: Real-time location sharing between group members
* **Group Management**: Create, join, and leave groups
* **Points of Interest**: Mark and share important locations with group members
* **Chat**: Group messaging system
* **Navigation**: Direction indicators to help find other group members
* **Authentication**: Secure login with Google OAuth

## License
Distributed under the MIT License. See LICENSE.txt for more information.

## Contact
* For questions or support, create an issue on GitHub and we will respond as quickly as possible.