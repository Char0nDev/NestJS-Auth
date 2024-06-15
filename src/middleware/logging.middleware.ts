import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  logger = new Logger('Response')
  use(req: Request, res: Response, next: NextFunction) {
    const {originalUrl : url , method} = req;
    const reqTime = new Date().getTime();

    res.on('finish' , () => {
      const resTime = new Date().getTime();

      if(res.statusCode == 200 || res.statusCode == 201){
        this.logger.log(
          `${method} ${url} ${res.statusCode} +${resTime - reqTime}ms`
        )
      };

    })

    next();
  }
}
