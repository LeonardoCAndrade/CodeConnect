import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard, OptionalAuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { CreateCommentDto, CreatePostDto } from './dto/create-post.dto.js';
import {
  ListPostsQueryDto,
  ListTagsQueryDto,
} from './dto/list-posts-query.dto.js';
import {
  CommentResponseDto,
  PostDetailResponseDto,
  PostPageResponseDto,
  TagResponseDto,
} from './dto/post-response.dto.js';
import { PostsService } from './posts.service.js';

const optionalAuthNote =
  'Público. Com um token Bearer válido, likedByMe indica se o usuário curtiu.';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista o feed de posts',
    description: optionalAuthNote,
  })
  @ApiOkResponse({ type: PostPageResponseDto })
  @ApiBadRequestResponse({ description: 'Parâmetros inválidos' })
  list(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<PostPageResponseDto> {
    return this.postsService.list(query, user?.sub);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna um post', description: optionalAuthNote })
  @ApiOkResponse({ type: PostDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Post não encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.findById(id, user?.sub);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publica um post' })
  @ApiCreatedResponse({
    type: PostDetailResponseDto,
    headers: {
      Location: {
        description: 'URL do post criado',
        schema: { type: 'string', example: '/posts/{id}' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostDetailResponseDto> {
    const post = await this.postsService.create(dto, user.sub);
    res.location(`/posts/${post.id}`);
    return post;
  }

  @Put(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Curte o post',
    description: 'Idempotente: repetir mantém uma única curtida.',
  })
  @ApiNoContentResponse({ description: 'Post curtido' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Post não encontrado' })
  like(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.postsService.like(id, user.sub);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a curtida do post',
    description:
      'Idempotente: remover uma curtida inexistente também retorna 204.',
  })
  @ApiNoContentResponse({ description: 'Curtida removida' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Post não encontrado' })
  unlike(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.postsService.unlike(id, user.sub);
  }

  @Get(':id/comments')
  @ApiOperation({
    summary: 'Lista os comentários do post, dos mais antigos aos mais novos',
  })
  @ApiOkResponse({ type: [CommentResponseDto] })
  @ApiNotFoundResponse({ description: 'Post não encontrado' })
  listComments(@Param('id') id: string): Promise<CommentResponseDto[]> {
    return this.postsService.listComments(id);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comenta no post' })
  @ApiCreatedResponse({
    type: CommentResponseDto,
    headers: {
      Location: {
        description: 'URL da coleção de comentários do post',
        schema: { type: 'string', example: '/posts/{id}/comments' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Post não encontrado' })
  async createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommentResponseDto> {
    const comment = await this.postsService.createComment(id, dto, user.sub);
    res.location(`/posts/${id}/comments`);
    return comment;
  }
}

@ApiTags('posts')
@Controller('tags')
export class TagsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as tags mais usadas nos posts' })
  @ApiOkResponse({ type: [TagResponseDto] })
  @ApiBadRequestResponse({ description: 'Parâmetros inválidos' })
  list(@Query() query: ListTagsQueryDto): Promise<TagResponseDto[]> {
    return this.postsService.listTags(query.limit);
  }
}
