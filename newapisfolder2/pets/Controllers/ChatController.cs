using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using RealtimeAPI.Data;
using RealtimeAPI.Hubs;
using RealtimeAPI.Models;
using System.Security.Claims;

namespace RealtimeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public ChatController(IHubContext<ChatHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        // Get all conversations for the current user
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            // Get all unique conversation IDs where the user is either sender or receiver
            var conversationIds = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => m.ConversationId)
                .Distinct()
                .ToListAsync();

            // For each conversation ID, get the latest message and participants
            var conversations = new List<object>();
            foreach (var conversationId in conversationIds)
            {
                var latestMessage = await _context.Messages
                    .Where(m => m.ConversationId == conversationId)
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefaultAsync();

                if (latestMessage != null)
                {
                    var otherUserId = latestMessage.SenderId == userId ? latestMessage.ReceiverId : latestMessage.SenderId;
                    var otherUser = await _context.Users
                        .Where(u => u.Id == otherUserId)
                        .Select(u => new { u.Id, u.Username, u.Email })
                        .FirstOrDefaultAsync();

                    conversations.Add(new
                    {
                        ConversationId = conversationId,
                        OtherUser = otherUser,
                        LastMessage = new
                        {
                            latestMessage.Content,
                            latestMessage.SentAt,
                            latestMessage.IsDelivered,
                            latestMessage.DeliveredAt
                        }
                    });
                }
            }

            return Ok(conversations);
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetMessages(int conversationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            // Check if user is part of this conversation
            var isUserInConversation = await _context.Messages
                .AnyAsync(m => m.ConversationId == conversationId && 
                    (m.SenderId == userId || m.ReceiverId == userId));

            if (!isUserInConversation)
                return NotFound();

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }

        // Get chat history with a specific user
        [HttpGet("history/{otherUserId}")]
        public async Task<IActionResult> GetChatHistory(string otherUserId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                           (m.SenderId == otherUserId && m.ReceiverId == userId))
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.SentAt,
                    IsFromMe = m.SenderId == userId
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("conversations")]
        public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Create a new conversation
            var conversation = new Conversation
            {
                Participant1Id = userId,
                Participant2Id = request.ReceiverId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();

            // Create the first message in the conversation
            var message = new Message
            {
                SenderId = userId,
                ReceiverId = request.ReceiverId,
                Content = "Conversation started",
                SentAt = DateTime.UtcNow,
                IsDelivered = false,
                ConversationId = conversation.Id
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { 
                ConversationId = conversation.Id,
                Message = message
            });
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var message = new Message
            {
                SenderId = userId,
                ReceiverId = request.ReceiverId,
                Content = request.Content,
                SentAt = DateTime.UtcNow,
                ConversationId = request.ConversationId,
                IsDelivered = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Notify the recipient through SignalR
            await _hubContext.Clients.User(message.ReceiverId)
                .SendAsync("ReceiveMessage", message);

            return Ok(message);
        }

        [HttpPut("messages/{messageId}/delivered")]
        public async Task<IActionResult> MarkMessageAsDelivered(int messageId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var message = await _context.Messages
                .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId);

            if (message == null)
                return NotFound();

            message.IsDelivered = true;
            message.DeliveredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify the sender through SignalR
            await _hubContext.Clients.User(message.SenderId)
                .SendAsync("MessageDelivered", messageId);

            return Ok(message);
        }

        public class CreateConversationRequest
        {
            public string ReceiverId { get; set; } = string.Empty;
        }

        public class SendMessageRequest
        {
            public int ConversationId { get; set; }
            public string ReceiverId { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
        }
    }
}