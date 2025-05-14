using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using RealtimeAPI.Data;
using RealtimeAPI.Hubs;
using RealtimeAPI.Models;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace RealtimeAPI.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ChatController> _logger;

        public ChatController(IHubContext<ChatHub> hubContext, ApplicationDbContext context, ILogger<ChatController> logger)
        {
            _hubContext = hubContext;
            _context = context;
            _logger = logger;
        }

        // Get all conversations for the current user
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            var conversations = await _context.Conversations
                .Include(c => c.Participant1)
                .Include(c => c.Participant2)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .Where(c => c.Participant1Id == userId || c.Participant2Id == userId)
                .ToListAsync();

            var result = conversations.Select(c => new
            {
                Id = c.Id,
                Participant1 = new { c.Participant1.Id, c.Participant1.Username },
                Participant2 = new { c.Participant2.Id, c.Participant2.Username },
                LastMessage = c.Messages.FirstOrDefault() == null ? null : new
                {
                    c.Messages.First().Content,
                    c.Messages.First().SentAt,
                    c.Messages.First().IsDelivered,
                    c.Messages.First().DeliveredAt
                }
            });

            return Ok(result);
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetMessages(int conversationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            // Check if user is part of this conversation
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == conversationId && 
                    (c.Participant1Id == userId || c.Participant2Id == userId));

            if (conversation == null)
                return NotFound();

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.SentAt,
                    m.IsDelivered,
                    m.DeliveredAt,
                    m.ConversationId,
                    SenderId = m.SenderId,
                    SenderUsername = m.Sender.Username,
                    ReceiverId = m.ReceiverId,
                    ReceiverUsername = m.Receiver.Username
                })
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

            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => 
                    (c.Participant1Id == userId && c.Participant2Id == otherUserId) ||
                    (c.Participant1Id == otherUserId && c.Participant2Id == userId));

            if (conversation == null)
                return Ok(new List<object>());

            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversation.Id)
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
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized("User not authenticated");
                }

                // Validate that both users exist
                var user1 = await _context.Users.FindAsync(currentUserId);
                var user2 = await _context.Users.FindAsync(request.ParticipantId);

                if (user1 == null || user2 == null)
                {
                    return NotFound("One or both users not found");
                }

                // Check if conversation already exists
                var existingConversation = await _context.Conversations
                    .FirstOrDefaultAsync(c => 
                        (c.Participant1Id == currentUserId && c.Participant2Id == request.ParticipantId) ||
                        (c.Participant1Id == request.ParticipantId && c.Participant2Id == currentUserId));

                if (existingConversation != null)
                {
                    return Ok(existingConversation);
                }

                // Create new conversation
                var conversation = new Conversation
                {
                    Participant1Id = currentUserId,
                    Participant2Id = request.ParticipantId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Conversations.Add(conversation);
                await _context.SaveChangesAsync();

                // Notify participants
                await _hubContext.Clients.Users(new[] { currentUserId, request.ParticipantId })
                    .SendAsync("ConversationCreated", conversation);

                return Ok(conversation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating conversation");
                return StatusCode(500, "An error occurred while creating the conversation");
            }
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check if conversation exists, if not create it
                var conversation = await _context.Conversations
                    .FirstOrDefaultAsync(c => c.Id == request.ConversationId);

                if (conversation == null)
                {
                    // Create new conversation
                    conversation = new Conversation
                    {
                        Participant1Id = userId,
                        Participant2Id = request.ReceiverId,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Conversations.Add(conversation);
                    await _context.SaveChangesAsync();
                    request.ConversationId = conversation.Id;
                }
                else
                {
                    // Verify user is part of the conversation
                    if (conversation.Participant1Id != userId && conversation.Participant2Id != userId)
                    {
                        return Forbid();
                    }
                }

                var message = new Message
                {
                    SenderId = userId,
                    ReceiverId = request.ReceiverId,
                    Content = request.Content,
                    SentAt = DateTime.UtcNow,
                    ConversationId = conversation.Id,
                    IsDelivered = false
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                // Get usernames for the response
                var sender = await _context.Users.FindAsync(userId);
                var receiver = await _context.Users.FindAsync(request.ReceiverId);

                var messageResponse = new
                {
                    message.Id,
                    message.Content,
                    message.SentAt,
                    message.IsDelivered,
                    message.DeliveredAt,
                    message.ConversationId,
                    SenderId = message.SenderId,
                    SenderUsername = sender?.Username,
                    ReceiverId = message.ReceiverId,
                    ReceiverUsername = receiver?.Username
                };

                await transaction.CommitAsync();

                // Notify the recipient through SignalR
                await _hubContext.Clients.User(message.ReceiverId)
                    .SendAsync("ReceiveMessage", messageResponse);

                return Ok(messageResponse);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
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
            public string ParticipantId { get; set; } = string.Empty;
        }

        public class SendMessageRequest
        {
            public int ConversationId { get; set; }
            public string ReceiverId { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
        }
    }
}