import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, tap } from 'rxjs';
import { Repository } from 'typeorm';
import { Audit } from './audit.entity';
import * as uuid from 'uuid';

@Injectable()
export class AuditInterceptor<T> implements NestInterceptor<T, Response> {

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {

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
