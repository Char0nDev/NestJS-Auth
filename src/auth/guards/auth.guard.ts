import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

interface IPayload {
  userId: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const token = this.extraTokenFromHeader(req);

      if (!token) {
        throw new UnauthorizedException('Invalid token.');
      }

      const payload: IPayload = this.jwtService.verify(token);
      req.userId = payload.userId;
    } catch (e) {
      Logger.error(e);
      throw new UnauthorizedException('Invalid token.');
    }

    return true;
  }

  private extraTokenFromHeader(req: Request): string | undefined {
    return req.headers.authorization.split(' ')[1];
  }
}
