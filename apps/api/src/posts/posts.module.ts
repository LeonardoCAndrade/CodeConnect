import { Module } from '@nestjs/common';
import { PostsController, TagsController } from './posts.controller.js';
import { PostsRepository } from './posts.repository.js';
import { PostsService } from './posts.service.js';
import { PrismaPostsRepository } from './prisma-posts.repository.js';

@Module({
  controllers: [PostsController, TagsController],
  providers: [
    PostsService,
    { provide: PostsRepository, useClass: PrismaPostsRepository },
  ],
})
export class PostsModule {}
