import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Julio Lima' })
  name: string;

  @ApiProperty({
    example: 'julio.lima',
    description: 'Identificador exibido (sem @), derivado do nome',
  })
  handle: string;
}

export class PostResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Hooks personalizados no React' })
  title: string;

  @ApiProperty({ example: 'Como extrair lógica reutilizável de componentes.' })
  body: string;

  @ApiProperty({
    type: String,
    nullable: true,
    format: 'uri',
    description: 'URL externa da imagem; null quando o post não tem imagem',
  })
  imageUrl: string | null;

  @ApiProperty({ type: [String], example: ['React', 'Front-end'] })
  tags: string[];

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty({ example: 12 })
  likesCount: number;

  @ApiProperty({ example: 3 })
  commentsCount: number;

  @ApiProperty({
    description: 'Se o usuário autenticado curtiu o post (false para anônimos)',
  })
  likedByMe: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;
}

export class PostDetailResponseDto extends PostResponseDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Trecho de código do projeto',
  })
  code: string | null;
}

export class PostPageResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  items: PostResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 6 })
  pageSize: number;

  @ApiProperty({
    example: 10,
    description: 'Total de posts que atendem ao filtro',
  })
  total: number;
}

export class CommentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Achei muito bom seu código, parabéns!' })
  body: string;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;
}

export class TagResponseDto {
  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 4 })
  postsCount: number;
}
