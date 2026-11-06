import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Texto vazio em campo opcional equivale a não informar.
const trimOrUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

// Remove espaços e duplicatas sem diferenciar maiúsculas, mantendo a primeira grafia.
const normalizeTags = ({ value }: { value: unknown }) => {
  if (!Array.isArray(value)) return value;
  const seen = new Set<string>();
  const tags: unknown[] = [];
  for (const item of value) {
    const tag = typeof item === 'string' ? item.trim() : item;
    const key = typeof tag === 'string' ? tag.toLowerCase() : tag;
    if (typeof key === 'string' && seen.has(key)) continue;
    if (typeof key === 'string') seen.add(key);
    tags.push(tag);
  }
  return tags;
};

export class CreatePostDto {
  @ApiProperty({ example: 'React zero to hero', minLength: 1, maxLength: 120 })
  @Transform(trim)
  @IsString()
  @Length(1, 120)
  title: string;

  @ApiProperty({
    example: 'Projeto para praticar hooks e componentes.',
    minLength: 1,
    maxLength: 2000,
  })
  @Transform(trim)
  @IsString()
  @Length(1, 2000)
  body: string;

  @ApiPropertyOptional({
    example: 'const soma = (a, b) => a + b',
    maxLength: 10000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  code?: string;

  @ApiPropertyOptional({
    example: 'https://picsum.photos/seed/projeto/960/480',
    format: 'uri',
    maxLength: 2048,
  })
  @Transform(trimOrUndefined)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  imageUrl?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['React', 'Front-end'],
    maxItems: 5,
  })
  @IsOptional()
  @Transform(normalizeTags)
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Length(1, 30, { each: true })
  tags?: string[];
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Muito bom!', minLength: 1, maxLength: 1000 })
  @Transform(trim)
  @IsString()
  @Length(1, 1000)
  body: string;
}
