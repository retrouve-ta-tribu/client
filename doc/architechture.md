# Retrouve Ta Tribu - Architecture Documentation

## Application Architecture

The "Retrouve Ta Tribu" application follows a client-side React application architecture with real-time connectivity to backend services. The architecture is designed around the core functionality of location sharing and group coordination.

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **State Management**: React Hooks and Context
- **Real-time Communication**: WebSockets (Socket.IO)
- **Map Visualization**: Likely using Leaflet or Google Maps API
- **Authentication**: Google OAuth integration

## Component Architecture

### High-Level Structure

```
client/
├── src/
│   ├── components/     # UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # Service layer for API and functionality
│   ├── styles/         # CSS/styling
│   ├── utils/          # Utility functions
│   ├── shaders/        # WebGL shaders for 3D visualizations
│   └── App.tsx         # Main application component
```

## Service Layer

The service layer abstracts communication with backend APIs and provides functionality to the application:

```
services/
├── authService.ts            # Authentication services
├── deviceOrientationService.ts # Device orientation tracking
├── geolocationService.ts     # Geolocation services
├── groupService.ts           # Group management
├── locationSharingService.ts # Location sharing functionality
├── messageChatService.ts     # Chat messaging
├── pointsOfInterestService.ts # Points of interest management
├── socketService.ts          # WebSocket connection management
├── userService.ts            # User management
├── worldCalculationService.ts # Geographic calculations
└── types.ts                  # Common type definitions
```

## Data Flow

### Authentication Flow

1. User initiates login (Login.tsx)
2. authService.ts handles Google OAuth flow
3. Upon successful authentication, user profile is stored
4. App routes to Home page with authenticated state

### Location Sharing Flow

1. User joins a group (GroupDetails.tsx)
2. locationSharingService.ts initiates location sharing
3. geolocationService.ts tracks device position
4. socketService.ts broadcasts position to other members
5. GroupMap.tsx renders updated positions

### Group Communication Flow

1. User enters a message in Conversation.tsx
2. messageChatService.ts sends message via socketService.ts
3. Backend distributes message to other group members
4. messageChatService.ts receives incoming messages
5. Conversation.tsx updates to display new messages

## Real-time System Architecture

The application uses WebSockets for real-time updates:

1. socketService.ts manages the WebSocket connection
2. Services subscribe to relevant events:
   - locationSharingService.ts → location updates
   - messageChatService.ts → chat messages
   - pointsOfInterestService.ts → points of interest changes
   - groupService.ts → group membership changes

## Key Architectural Patterns

### Observer Pattern

Services implement observer patterns for event handling:
- Services expose methods like `addLocationUpdateListener` and `removeLocationUpdateListener`
- Components subscribe to these events to receive updates

### Service-Hook Pattern

Custom hooks abstract service interactions:
- `useAuthState` → authService.ts
- `useGroupData` → groupService.ts
- `useLocationSharing` → locationSharingService.ts
- `usePointsOfInterest` → pointsOfInterestService.ts

### Component Composition

UI is built through component composition:
- PageContainer → PageHeader → content
- GroupMap → MemberLocation + PointOfInterestCard
- MemberList → MemberCard

## Device Integration

### Geolocation

- geolocationService.ts interfaces with browser's Geolocation API
- Provides position tracking with event-based updates

### Device Orientation

- deviceOrientationService.ts interfaces with DeviceOrientation API
- Enables compass and direction features
- Handles permissions for orientation access

## Security Considerations

1. Authentication uses OAuth for secure identity verification
2. Location data is only shared within authorized groups
3. Permissions are requested explicitly from users
4. Real-time connections use secure WebSockets

## Scalability Considerations

1. Stateless frontend allows for horizontal scaling
2. Service-based architecture enables modular development
3. WebSocket connections managed through socketService.ts
4. Potential for optimizing location update frequency