-- Drop existing foreign keys
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Messages_Conversations_ConversationID')
    ALTER TABLE Messages DROP CONSTRAINT FK_Messages_Conversations_ConversationID;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Messages_Users_SenderID')
    ALTER TABLE Messages DROP CONSTRAINT FK_Messages_Users_SenderID;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Messages_Users_ReceiverID')
    ALTER TABLE Messages DROP CONSTRAINT FK_Messages_Users_ReceiverID;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Conversations_Users_Participant1ID')
    ALTER TABLE Conversations DROP CONSTRAINT FK_Conversations_Users_Participant1ID;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Conversations_Users_Participant2ID')
    ALTER TABLE Conversations DROP CONSTRAINT FK_Conversations_Users_Participant2ID;

-- Drop existing tables if they exist
IF OBJECT_ID('dbo.Messages', 'U') IS NOT NULL
    DROP TABLE dbo.Messages;
IF OBJECT_ID('dbo.Conversations', 'U') IS NOT NULL
    DROP TABLE dbo.Conversations;

-- Create Conversations table
CREATE TABLE [Conversations] (
    [ConversationID] int NOT NULL IDENTITY(1,1),
    [Participant1ID] int NOT NULL,
    [Participant2ID] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Conversations] PRIMARY KEY ([ConversationID]),
    CONSTRAINT [FK_Conversations_Users_Participant1ID] FOREIGN KEY ([Participant1ID]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Conversations_Users_Participant2ID] FOREIGN KEY ([Participant2ID]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

-- Create Messages table
CREATE TABLE [Messages] (
    [MessageID] int NOT NULL IDENTITY(1,1),
    [ConversationID] int NOT NULL,
    [SenderID] int NOT NULL,
    [ReceiverID] int NOT NULL,
    [Content] nvarchar(1000) NOT NULL,
    [SentAt] datetime2 NOT NULL DEFAULT GETDATE(),
    [IsDelivered] bit NOT NULL DEFAULT 0,
    [DeliveredAt] datetime2 NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([MessageID]),
    CONSTRAINT [FK_Messages_Conversations_ConversationID] FOREIGN KEY ([ConversationID]) REFERENCES [Conversations] ([ConversationID]) ON DELETE CASCADE,
    CONSTRAINT [FK_Messages_Users_SenderID] FOREIGN KEY ([SenderID]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Messages_Users_ReceiverID] FOREIGN KEY ([ReceiverID]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

-- Create indexes
CREATE INDEX [IX_Conversations_Participant1ID] ON [Conversations] ([Participant1ID]);
CREATE INDEX [IX_Conversations_Participant2ID] ON [Conversations] ([Participant2ID]);
CREATE INDEX [IX_Messages_ConversationID] ON [Messages] ([ConversationID]);
CREATE INDEX [IX_Messages_SenderID] ON [Messages] ([SenderID]);
CREATE INDEX [IX_Messages_ReceiverID] ON [Messages] ([ReceiverID]); 