import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid', example: '3f1c2b4e-8a1d-4c6e-9f2a-1b2c3d4e5f60' })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  name: string;

  @ApiProperty({ example: 'ana@example.com', format: 'email' })
  email: string;

  @ApiProperty({ format: 'date-time', example: '2026-11-05T12:00:00.000Z' })
  createdAt: Date;
}
