import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signUp.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refreshToken.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';
import { ResetPasswordDto } from './dtos/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUoData: SignUpDto) {
    return this.authService.signUp(signUoData);
  }

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshToken.token);
  }

  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() { userId },
  ) {
    return this.authService.changePassword(
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
      userId,
    );
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.token,
    );
  }
}
