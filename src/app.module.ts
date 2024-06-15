import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports : [ConfigModule],
      useFactory : async (configService : ConfigService) => ({
        secret : configService.get<string>('JWT_SECRET')
      }),
      global : true,
      inject : [ConfigService]
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true
    }),
    MongooseModule.forRootAsync({
      imports : [ConfigModule], 
      useFactory: async (configService : ConfigService) => ({
        uri : configService.get<string>('MONGODB_URI')
      }),
      inject : [ConfigService]
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*')
  }
}
