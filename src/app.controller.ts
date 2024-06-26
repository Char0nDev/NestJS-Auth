import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  protectedRoute(@Req() { userId }) {
    return { message: this.appService.getHello(), userId };
  }
}
