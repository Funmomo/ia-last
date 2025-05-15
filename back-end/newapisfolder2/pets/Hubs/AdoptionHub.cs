using Microsoft.AspNetCore.SignalR;
using RealtimeAPI.Models;

namespace RealtimeAPI.Hubs
{
    public class AdoptionHub : Hub
    {
        public async Task AdoptionRequestCreated(AdoptionRequest request)
        {
            await Clients.All.SendAsync("AdoptionRequestCreated", request);
        }

        public async Task AdoptionRequestStatusUpdated(AdoptionRequest request)
        {
            await Clients.All.SendAsync("AdoptionRequestStatusUpdated", request);
        }
    }
} 