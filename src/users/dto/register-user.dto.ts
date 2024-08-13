import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class RegisterUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsStrongPassword()
  @ApiProperty()
  password: string;
}
