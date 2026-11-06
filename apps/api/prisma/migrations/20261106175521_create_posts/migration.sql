BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[posts] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(120) NOT NULL,
    [body] NVARCHAR(2000) NOT NULL,
    [code] NVARCHAR(max),
    [image_url] NVARCHAR(2048),
    [author_id] UNIQUEIDENTIFIER NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [posts_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [posts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[tags] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(30) NOT NULL,
    CONSTRAINT [tags_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [tags_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[post_tags] (
    [post_id] UNIQUEIDENTIFIER NOT NULL,
    [tag_id] INT NOT NULL,
    CONSTRAINT [post_tags_pkey] PRIMARY KEY CLUSTERED ([post_id],[tag_id])
);

-- CreateTable
CREATE TABLE [dbo].[likes] (
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [post_id] UNIQUEIDENTIFIER NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [likes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [likes_pkey] PRIMARY KEY CLUSTERED ([user_id],[post_id])
);

-- CreateTable
CREATE TABLE [dbo].[comments] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [body] NVARCHAR(1000) NOT NULL,
    [post_id] UNIQUEIDENTIFIER NOT NULL,
    [author_id] UNIQUEIDENTIFIER NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [comments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [comments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [posts_created_at_idx] ON [dbo].[posts]([created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [posts_author_id_idx] ON [dbo].[posts]([author_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [post_tags_tag_id_idx] ON [dbo].[post_tags]([tag_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [likes_post_id_idx] ON [dbo].[likes]([post_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comments_post_id_created_at_idx] ON [dbo].[comments]([post_id], [created_at]);

-- AddForeignKey
ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_author_id_fkey] FOREIGN KEY ([author_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post_tags] ADD CONSTRAINT [post_tags_post_id_fkey] FOREIGN KEY ([post_id]) REFERENCES [dbo].[posts]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[post_tags] ADD CONSTRAINT [post_tags_tag_id_fkey] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[tags]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[likes] ADD CONSTRAINT [likes_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[likes] ADD CONSTRAINT [likes_post_id_fkey] FOREIGN KEY ([post_id]) REFERENCES [dbo].[posts]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_post_id_fkey] FOREIGN KEY ([post_id]) REFERENCES [dbo].[posts]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_author_id_fkey] FOREIGN KEY ([author_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
