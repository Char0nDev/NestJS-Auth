import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class CustomHttpException implements ExceptionFilter {
  logger = new Logger()
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req : Request = ctx.getRequest();
    const res : Response = ctx.getResponse();
    const statusCode = exception.getStatus();

    this.logger.error(
      `${req.method} ${req.originalUrl} ${statusCode} error : ${exception.message}`
    );

    const errorsDetails = exception.getResponse()
    res.status(statusCode).json({error : true , errorsDetails} )
  }
}
