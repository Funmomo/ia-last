using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Data;
using RealtimeAPI.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace RealtimeAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(ApplicationDbContext context, ILogger<ChatHub> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Add a simple ping method for keep-alive
        public Task Ping()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogDebug($"Ping received from user {userId} with connection ID {Context.ConnectionId}");
            return Task.CompletedTask;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId != null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.ConnectionId = Context.ConnectionId;
                    user.Status = "online";
                    await _context.SaveChangesAsync();
                    
                    await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                    await Clients.All.SendAsync("UserConnected", new { user.Id, user.Username, user.Status });
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId != null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.ConnectionId = null;
                    user.Status = "offline";
                    await _context.SaveChangesAsync();
                    
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                    await Clients.All.SendAsync("UserDisconnected", new { user.Id, user.Username, user.Status });
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(int conversationId, string receiverId, string content)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                _logger.LogWarning("User ID not found in claims while sending message");
                throw new HubException("User not authenticated");
            }

            var message = new Message
            {
                ConversationId = conversationId,
                SenderId = userId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsDelivered = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var messageResponse = new
            {
                message.Id,
                message.Content,
                message.SentAt,
                message.IsDelivered,
                SenderId = userId,
                ReceiverId = receiverId,
                ConversationId = conversationId
            };

            // Get the users for proper notification
            var receiver = await _context.Users.FindAsync(receiverId);
            var sender = await _context.Users.FindAsync(userId);

            // Send to receiver if online
            if (receiver?.ConnectionId != null)
            {
                _logger.LogInformation($"Sending message to receiver {receiverId} with connection ID {receiver.ConnectionId}");
                await Clients.Client(receiver.ConnectionId).SendAsync("ReceiveMessage", messageResponse);
            }
            else
            {
                _logger.LogInformation($"Receiver {receiverId} is offline or not found");
            }

            // Always echo back to sender's current connection
            // This ensures the sender sees their message in real-time too
            _logger.LogInformation($"Echoing message back to sender {userId} with connection ID {Context.ConnectionId}");
            await Clients.Caller.SendAsync("ReceiveMessage", messageResponse);

            // If sender has multiple connections (e.g., multiple browser tabs),
            // notify those as well, except the current one
            if (sender?.ConnectionId != null && sender.ConnectionId != Context.ConnectionId)
            {
                _logger.LogInformation($"Notifying sender's other connection {sender.ConnectionId}");
                await Clients.Client(sender.ConnectionId).SendAsync("ReceiveMessage", messageResponse);
            }
        }

        public async Task MarkMessageAsDelivered(int messageId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                throw new HubException("User not authenticated");
            }

            var message = await _context.Messages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId);

            if (message == null)
            {
                throw new HubException("Message not found or not authorized");
            }

            message.IsDelivered = true;
            message.DeliveredAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            if (message.Sender?.ConnectionId != null)
            {
                await Clients.Client(message.Sender.ConnectionId).SendAsync("MessageDelivered", messageId);
            }
        }
    }
}