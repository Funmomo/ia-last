using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace RealtimeAPI.Data.Migrations
{
    public partial class AddConversationIdToMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConversationId",
                table: "Messages",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConversationId",
                table: "Messages");
        }
    }
}
