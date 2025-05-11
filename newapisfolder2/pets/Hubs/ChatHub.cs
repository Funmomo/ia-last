using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Data;
using RealtimeAPI.Models;
using System.Security.Claims;

namespace RealtimeAPI.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
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
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(int conversationId, string receiverId, string content)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

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

            var receiver = await _context.Users.FindAsync(message.ReceiverId);
            if (receiver?.ConnectionId != null)
            {
                await Clients.Client(receiver.ConnectionId).SendAsync("ReceiveMessage", message);
            }
        }

        public async Task MarkMessageAsDelivered(int messageId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            var message = await _context.Messages.FindAsync(messageId);
            if (message == null || message.ReceiverId != userId) return;

            message.IsDelivered = true;
            message.DeliveredAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var sender = await _context.Users.FindAsync(message.SenderId);
            if (sender?.ConnectionId != null)
            {
                await Clients.Client(sender.ConnectionId).SendAsync("MessageDelivered", messageId);
            }
        }
    }
}