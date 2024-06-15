import { IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @IsStrongPassword()
  password: string;

  @IsString()
  token: string;
}
