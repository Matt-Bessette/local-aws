import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, tap } from 'rxjs';
import { Repository } from 'typeorm';
import { Audit } from './audit.entity';
import * as uuid from 'uuid';
import { ConfigService } from '@nestjs/config';
import { CommonConfig } from '../config/common-config.interface';

@Injectable()
export class AuditInterceptor<T> implements NestInterceptor<T, Response> {

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    private readonly configService: ConfigService<CommonConfig>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {

    if (!this.configService.get('AUDIT')) {
      return next.handle();
    }

    const requestId = uuid.v4();
    const httpContext = context.switchToHttp();

    const request = httpContext.getRequest();
    const targetHeaderKey = Object.keys(request.headers).find( k => k.toLocaleLowerCase() === 'x-amz-target');
    const action = request.headers[targetHeaderKey] ? request.headers[targetHeaderKey] : request.body.Action;

    const response = context.switchToHttp().getResponse();

    response.header('x-amzn-RequestId', requestId);

    return next.handle().pipe(
      tap(async (data) => {
        await this.auditRepo.create({
          id: requestId,
          action,
          request: JSON.stringify({ __path: request.path, ...request.headers, ...request.body }),
          response: JSON.stringify(data),
        }).save();
      })
    );
  }
}
