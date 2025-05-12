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

        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation($"User {userId} connecting to ChatHub");

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
                        
                        _logger.LogInformation($"User {userId} ({user.Username}) connected successfully");
                    }
                }
                else
                {
                    _logger.LogWarning("User ID not found in claims during connection");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnConnectedAsync");
                throw;
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation($"User {userId} disconnecting from ChatHub");

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
                        
                        _logger.LogInformation($"User {userId} ({user.Username}) disconnected successfully");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnDisconnectedAsync");
                throw;
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(int conversationId, string receiverId, string content)
        {
            try
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

                var receiver = await _context.Users.FindAsync(receiverId);
                if (receiver?.ConnectionId != null)
                {
                    await Clients.Client(receiver.ConnectionId).SendAsync("ReceiveMessage", new
                    {
                        message.Id,
                        message.Content,
                        message.SentAt,
                        message.IsDelivered,
                        SenderId = userId,
                        ReceiverId = receiverId,
                        ConversationId = conversationId
                    });
                }
                else
                {
                    _logger.LogInformation($"Receiver {receiverId} is offline or not found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendMessage");
                throw new HubException("Failed to send message", ex);
            }
        }

        public async Task MarkMessageAsDelivered(int messageId)
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    _logger.LogWarning("User ID not found in claims while marking message as delivered");
                    throw new HubException("User not authenticated");
                }

                var message = await _context.Messages
                    .Include(m => m.Sender)
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId);

                if (message == null)
                {
                    _logger.LogWarning($"Message {messageId} not found or user {userId} not authorized");
                    throw new HubException("Message not found or not authorized");
                }

                message.IsDelivered = true;
                message.DeliveredAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                if (message.Sender?.ConnectionId != null)
                {
                    await Clients.Client(message.Sender.ConnectionId).SendAsync("MessageDelivered", new
                    {
                        MessageId = messageId,
                        DeliveredAt = message.DeliveredAt
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in MarkMessageAsDelivered");
                throw new HubException("Failed to mark message as delivered", ex);
            }
        }
    }
}