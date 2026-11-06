import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { POST_SORTS, type PostSort } from '../posts.repository.js';

// ?tags=a&tags=b chega como array; ?tags=a chega como string.
const toArray = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : Array.isArray(value) ? value : [value];

export class ListPostsQueryDto {
  @ApiPropertyOptional({
    description:
      'Busca full-text no título e na descrição (por prefixo, todas as palavras)',
    example: 'react hooks',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filtra posts que tenham todas as tags informadas',
    example: ['React'],
  })
  @IsOptional()
  @Transform(toArray)
  @IsString({ each: true })
  @Length(1, 30, { each: true })
  @ArrayMaxSize(5)
  tags?: string[];

  @ApiPropertyOptional({ enum: POST_SORTS, default: 'recent' })
  @IsOptional()
  @IsIn(POST_SORTS)
  sort?: PostSort;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 24, default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  pageSize?: number;
}

export class ListTagsQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
