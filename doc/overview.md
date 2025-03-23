# Retrouve Ta Tribu - Technical Documentation

## Overview

"Retrouve Ta Tribu" is a location-sharing application designed to help groups of people find each other in real-time. The application allows users to create groups, share their location with group members, set points of interest, and communicate through a chat system.

## Architecture

The application is built using a client-server architecture:

- **Frontend**: React.js with TypeScript
- **Backend**: Not visible in the provided code, but likely a RESTful API service
- **Real-time Communication**: WebSockets (via Socket.IO)

## Core Components

### Authentication

The application uses Google Authentication for user login and management. The `AuthService` handles the authentication flow and maintains the user's authentication state.

### Location Sharing

Location sharing is a core feature of the application:

- `LocationSharingService`: Manages the sharing and updating of user locations
- `GeolocationService`: Interfaces with the browser's Geolocation API
- `DeviceOrientationService`: Tracks device orientation for direction features

### Groups

Groups are the primary organizational unit:

- Users can create, join, and leave groups
- Group members can see each other's locations
- Each group has its own chat room
- Groups can have points of interest marked on a map

### Maps and Navigation

The application includes mapping features:

- `GroupMap`: Displays the locations of group members and points of interest
- `DirectionVisualizer`: Uses device orientation to point users toward targets
- `WorldCalculationService`: Provides functions for calculating bearings, distances, and directions

### Real-time Communication

Communication between users is handled through:

- `SocketService`: Manages WebSocket connections
- `MessageChatService`: Handles chat functionality between group members

## Services
- `authService`: Manages user authentication with Google OAuth.
- `userService`: Manages user management and friend relationships.
- `groupService`: Manages group operations.
- `locationSharingService`: Manages the sharing of location data between group members.
- `pointsOfInterestService`: Manages points of interest within groups.
- `messageChatService`: Handles real-time chat functionality.
- `worldCalculationService`: Provides utilities for geographical calculations.

## Permissions

The application requires device permissions for location and orientation:

- Geolocation: Required for tracking user position
- Device Orientation: Required for direction features (compass)

## User Interface Components

The UI is organized around several main views:

- Login screen
- Home screen (list of groups)
- Group details screen (map, member list, chat)
- Friend management screen
- Group creation/editing screens

Key UI components include:
- `GroupMap`: Interactive map showing member locations
- `MemberList`: List of group members with status indicators
- `Conversation`: Chat interface for group communication
- `DirectionVisualizer`: Visual indicator for finding group members

## Page Flow

1. Users authenticate via the Login page
2. The Home page displays available groups
3. Group Details page shows the map, member list, and chat
4. Users can create/edit groups or manage friends