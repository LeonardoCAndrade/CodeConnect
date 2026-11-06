import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTokenDto {
  @ApiProperty({ example: 'ana@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', maxLength: 72 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
