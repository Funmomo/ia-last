using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealtimeAPI.Hubs;

namespace RealtimeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private static readonly Dictionary<string, UserInfo> _connectedUsers = new();

        public UserController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpGet("online")]
        public IActionResult GetOnlineUsers()
        {
            return Ok(_connectedUsers.Values);
        }

        [HttpPost("connect")]
        public async Task<IActionResult> Connect([FromBody] UserInfo userInfo)
        {
            if (!_connectedUsers.ContainsKey(userInfo.ConnectionId))
            {
                _connectedUsers[userInfo.ConnectionId] = userInfo;
                await _hubContext.Clients.All.SendAsync("UserConnected", userInfo);
            }
            return Ok();
        }

        [HttpPost("disconnect")]
        public async Task<IActionResult> Disconnect([FromBody] string connectionId)
        {
            if (_connectedUsers.TryGetValue(connectionId, out var userInfo))
            {
                _connectedUsers.Remove(connectionId);
                await _hubContext.Clients.All.SendAsync("UserDisconnected", userInfo);
            }
            return Ok();
        }

        [HttpPut("status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UserStatusUpdate statusUpdate)
        {
            if (_connectedUsers.TryGetValue(statusUpdate.ConnectionId, out var userInfo))
            {
                userInfo.Status = statusUpdate.Status;
                await _hubContext.Clients.All.SendAsync("UserStatusChanged", userInfo);
            }
            return Ok();
        }
    }

    public class UserInfo
    {
        public string ConnectionId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Status { get; set; } = "Online";
        public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    }

    public class UserStatusUpdate
    {
        public string ConnectionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
} 