# Pet Shelter Management System

A real-time web application for managing pet shelters, adoptions, and communication between users.

## Features

- User authentication and authorization
- Shelter management
- Pet listing and categorization
- Adoption request system
- Real-time chat between users
- Offline messaging support
- Role-based access control (Admin, Shelter Staff, Adopter)

## Prerequisites

- .NET 9.0 SDK
- SQL Server (or SQL Server Express)
- Visual Studio 2022 (recommended) or VS Code

## Database Setup

1. Install SQL Server if you haven't already:
   - Download SQL Server Express from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Follow the installation wizard

2. Create the database:
   - Open SQL Server Management Studio (SSMS)
   - Connect to your SQL Server instance
   - Create a new database named "RealtimeAPI"
   - Open the `schema.sql` file from this project
   - Execute the script to create all tables and relationships

## Application Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd RealtimeAPI
   ```

2. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=RealtimeAPI;Trusted_Connection=True;MultipleActiveResultSets=true"
     }
   }
   ```
   Adjust the connection string according to your SQL Server configuration.

3. Install dependencies:
   ```bash
   dotnet restore
   ```

4. Build the application:
   ```bash
   dotnet build
   ```

5. Run the application:
   ```bash
   dotnet run
   ```

The application will be available at:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001

## User Roles and Permissions

The system has three user roles defined in the `UserRole` enum:

```csharp
public enum UserRole
{
    Admin,          // Full system access
    ShelterStaff,   // Shelter-specific access
    Adopter         // Basic user access
}
```

### Role Capabilities

1. **Admin**
   - Create, update, and delete shelters
   - Manage all users and their roles
   - View and manage all adoption requests
   - Create and manage pet categories
   - Access all chat conversations
   - Manage system settings

2. **ShelterStaff**
   - Manage their assigned shelter's information
   - Add, update, and remove pets from their shelter
   - View and respond to adoption requests for their shelter
   - Chat with adopters and other staff
   - Update pet status and information

3. **Adopter**
   - Browse available pets
   - Submit adoption requests
   - Chat with shelter staff
   - Update their profile information
   - View their adoption request history

## Enums and Their Usage

### UserRole
```csharp
public enum UserRole
{
    Admin = 0,
    ShelterStaff = 1,
    Adopter = 2
}
```
Used in user registration and authorization.

### AdoptionStatus
```csharp
public enum AdoptionStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Completed = 3
}
```
Tracks the status of adoption requests.

## Real-Time Features

### Chat System

The application uses SignalR for real-time communication. Features include:

1. **Private Messaging**
   - One-on-one conversations
   - Message persistence for offline users
   - Message delivery status tracking
   - Support for multiple simultaneous conversations

2. **Group Chat**
   - Shelter-specific chat rooms
   - Admin broadcast messages

### How to Use the Chat System

1. **Private Messaging**
   ```javascript
   // Connect to the chat hub
   const connection = new signalR.HubConnectionBuilder()
       .withUrl("/chatHub")
       .withAutomaticReconnect()
       .build();

   // Send a private message
   await connection.invoke("SendPrivateMessage", toUserId, message);

   // Receive messages
   connection.on("ReceivePrivateMessage", (fromUser, message) => {
       console.log(`${fromUser}: ${message}`);
   });
   ```

2. **Group Chat**
   ```javascript
   // Join a group
   await connection.invoke("JoinGroup", groupName);

   // Send group message
   await connection.invoke("SendMessageToGroup", groupName, message);

   // Receive group messages
   connection.on("ReceiveGroupMessage", (user, message) => {
       console.log(`[${groupName}] ${user}: ${message}`);
   });
   ```

3. **Offline Messaging**
   - Messages are stored in the database
   - Delivered when recipient comes online
   - Delivery status tracking

## API Documentation

For detailed API documentation, please refer to [API.md](API.md).

## Troubleshooting Guide

### Database Issues

1. **Connection Failed**
   - Verify SQL Server is running
   - Check connection string format
   - Ensure database exists
   - Verify SQL Server authentication mode

2. **Migration Errors**
   - Delete existing migrations folder
   - Run `dotnet ef migrations add InitialCreate`
   - Run `dotnet ef database update`

### Authentication Issues

1. **JWT Token Invalid**
   - Check token expiration
   - Verify token format
   - Ensure correct secret key in appsettings.json

2. **Role-Based Access Denied**
   - Verify user role in database
   - Check [Authorize] attributes in controllers
   - Ensure proper role claims in token

### Real-Time Communication Issues

1. **SignalR Connection Failed**
   - Check CORS configuration
   - Verify SignalR hub route
   - Ensure HTTPS for production
   - Check firewall settings

2. **Messages Not Delivered**
   - Verify recipient's connection status
   - Check message persistence in database
   - Monitor SignalR connection logs

### Performance Issues

1. **Slow Database Queries**
   - Add missing indexes
   - Optimize complex queries
   - Consider database caching

2. **High Memory Usage**
   - Monitor connection pool size
   - Implement connection cleanup
   - Optimize real-time message handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 