-- Create Users table
CREATE TABLE [Users] (
    [Id] nvarchar(450) NOT NULL,
    [Username] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [Role] int NOT NULL,
    [ShelterId] int NULL,
    [ConnectionId] nvarchar(max) NULL,
    [Status] nvarchar(max) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

-- Create Shelters table
CREATE TABLE [Shelters] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Address] nvarchar(max) NOT NULL,
    [Phone] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Shelters] PRIMARY KEY ([Id])
);

-- Create Pets table
CREATE TABLE [Pets] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Species] nvarchar(max) NOT NULL,
    [Breed] nvarchar(max) NOT NULL,
    [Age] int NOT NULL,
    [Gender] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [ImageUrl] nvarchar(max) NULL,
    [ShelterId] int NOT NULL,
    [CategoryId] int NOT NULL,
    CONSTRAINT [PK_Pets] PRIMARY KEY ([Id])
);

-- Create PetCategories table
CREATE TABLE [PetCategories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_PetCategories] PRIMARY KEY ([Id])
);

-- Create AdoptionRequests table
CREATE TABLE [AdoptionRequests] (
    [Id] int NOT NULL IDENTITY,
    [PetId] int NOT NULL,
    [AdopterId] nvarchar(450) NOT NULL,
    [ShelterId] int NOT NULL,
    [Status] int NOT NULL,
    [RequestDate] datetime2 NOT NULL,
    CONSTRAINT [PK_AdoptionRequests] PRIMARY KEY ([Id])
);

-- Create Conversations table
CREATE TABLE [Conversations] (
    [Id] int NOT NULL IDENTITY,
    [Participant1Id] nvarchar(450) NOT NULL,
    [Participant2Id] nvarchar(450) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Conversations] PRIMARY KEY ([Id])
);

-- Create Messages table
CREATE TABLE [Messages] (
    [Id] int NOT NULL IDENTITY,
    [FromUserId] nvarchar(450) NOT NULL,
    [ToUserId] nvarchar(450) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [SentAt] datetime2 NOT NULL,
    [IsDelivered] bit NOT NULL,
    [DeliveredAt] datetime2 NULL,
    [ConversationId] int NOT NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([Id])
);

-- Create foreign key relationships
ALTER TABLE [Users] ADD CONSTRAINT [FK_Users_Shelters_ShelterId] 
    FOREIGN KEY ([ShelterId]) REFERENCES [Shelters] ([Id]) ON DELETE SET NULL;

ALTER TABLE [Pets] ADD CONSTRAINT [FK_Pets_Shelters_ShelterId] 
    FOREIGN KEY ([ShelterId]) REFERENCES [Shelters] ([Id]) ON DELETE CASCADE;

ALTER TABLE [Pets] ADD CONSTRAINT [FK_Pets_PetCategories_CategoryId] 
    FOREIGN KEY ([CategoryId]) REFERENCES [PetCategories] ([Id]) ON DELETE RESTRICT;

ALTER TABLE [AdoptionRequests] ADD CONSTRAINT [FK_AdoptionRequests_Pets_PetId] 
    FOREIGN KEY ([PetId]) REFERENCES [Pets] ([Id]) ON DELETE CASCADE;

ALTER TABLE [AdoptionRequests] ADD CONSTRAINT [FK_AdoptionRequests_Users_AdopterId] 
    FOREIGN KEY ([AdopterId]) REFERENCES [Users] ([Id]) ON DELETE RESTRICT;

ALTER TABLE [AdoptionRequests] ADD CONSTRAINT [FK_AdoptionRequests_Shelters_ShelterId] 
    FOREIGN KEY ([ShelterId]) REFERENCES [Shelters] ([Id]) ON DELETE RESTRICT;

ALTER TABLE [Conversations] ADD CONSTRAINT [FK_Conversations_Users_Participant1Id] 
    FOREIGN KEY ([Participant1Id]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Conversations] ADD CONSTRAINT [FK_Conversations_Users_Participant2Id] 
    FOREIGN KEY ([Participant2Id]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Messages] ADD CONSTRAINT [FK_Messages_Users_FromUserId] 
    FOREIGN KEY ([FromUserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;

ALTER TABLE [Messages] ADD CONSTRAINT [FK_Messages_Users_ToUserId] 
    FOREIGN KEY ([ToUserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;

ALTER TABLE [Messages] ADD CONSTRAINT [FK_Messages_Conversations_ConversationId] 
    FOREIGN KEY ([ConversationId]) REFERENCES [Conversations] ([Id]) ON DELETE NO ACTION;

-- Create indexes
CREATE INDEX [IX_Users_ShelterId] ON [Users] ([ShelterId]);
CREATE INDEX [IX_Pets_CategoryId] ON [Pets] ([CategoryId]);
CREATE INDEX [IX_Pets_ShelterId] ON [Pets] ([ShelterId]);
CREATE INDEX [IX_AdoptionRequests_AdopterId] ON [AdoptionRequests] ([AdopterId]);
CREATE INDEX [IX_AdoptionRequests_PetId] ON [AdoptionRequests] ([PetId]);
CREATE INDEX [IX_AdoptionRequests_ShelterId] ON [AdoptionRequests] ([ShelterId]);
CREATE INDEX [IX_Conversations_Participant1Id] ON [Conversations] ([Participant1Id]);
CREATE INDEX [IX_Conversations_Participant2Id] ON [Conversations] ([Participant2Id]);
CREATE INDEX [IX_Messages_FromUserId] ON [Messages] ([FromUserId]);
CREATE INDEX [IX_Messages_ToUserId] ON [Messages] ([ToUserId]);
CREATE INDEX [IX_Messages_ConversationId] ON [Messages] ([ConversationId]); 