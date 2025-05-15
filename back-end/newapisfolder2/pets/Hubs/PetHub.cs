using Microsoft.AspNetCore.SignalR;
using RealtimeAPI.Models;

namespace RealtimeAPI.Hubs
{
    public class PetHub : Hub
    {
        public async Task PetCreated(Pet pet)
        {
            await Clients.All.SendAsync("PetCreated", pet);
        }

        public async Task PetUpdated(Pet pet)
        {
            await Clients.All.SendAsync("PetUpdated", pet);
        }

        public async Task PetDeleted(int petId)
        {
            await Clients.All.SendAsync("PetDeleted", petId);
        }

        public async Task PetStatusUpdated(Pet pet)
        {
            await Clients.All.SendAsync("PetStatusUpdated", pet);
        }
    }
} 