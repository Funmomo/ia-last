-- Drop existing tables if they exist
IF OBJECT_ID('dbo.Messages', 'U') IS NOT NULL
    DROP TABLE dbo.Messages;
IF OBJECT_ID('dbo.Conversations', 'U') IS NOT NULL
    DROP TABLE dbo.Conversations;

-- Create Conversations table
CREATE TABLE [Conversations] (
    [Id] int NOT NULL IDENTITY(1,1),
    [Participant1Id] nvarchar(450) NOT NULL,
    [Participant2Id] nvarchar(450) NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Conversations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Conversations_Users_Participant1Id] FOREIGN KEY ([Participant1Id]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Conversations_Users_Participant2Id] FOREIGN KEY ([Participant2Id]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

-- Create Messages table
CREATE TABLE [Messages] (
    [Id] int NOT NULL IDENTITY(1,1),
    [ConversationId] int NOT NULL,
    [SenderId] nvarchar(450) NOT NULL,
    [ReceiverId] nvarchar(450) NOT NULL,
    [Content] nvarchar(1000) NOT NULL,
    [SentAt] datetime2 NOT NULL DEFAULT GETDATE(),
    [IsDelivered] bit NOT NULL DEFAULT 0,
    [DeliveredAt] datetime2 NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Messages_Conversations_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [Conversations] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Messages_Users_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Messages_Users_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

-- Create indexes
CREATE INDEX [IX_Conversations_Participant1Id] ON [Conversations] ([Participant1Id]);
CREATE INDEX [IX_Conversations_Participant2Id] ON [Conversations] ([Participant2Id]);
CREATE INDEX [IX_Messages_ConversationId] ON [Messages] ([ConversationId]);
CREATE INDEX [IX_Messages_SenderId] ON [Messages] ([SenderId]);
CREATE INDEX [IX_Messages_ReceiverId] ON [Messages] ([ReceiverId]); 