import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionHandlers } from './app.constants';
import { CommonConfig } from './config/common-config.interface';
import localConfig from './config/local.config';
import { SnsHandlers } from './sns/sns.constants';
import { SnsModule } from './sns/sns.module';
import { AppController } from './app.controller';
import { AwsSharedEntitiesModule } from './aws-shared-entities/aws-shared-entities.module';
import { SecretsManagerModule } from './secrets-manager/secrets-manager.module';
import { SecretsManagerHandlers } from './secrets-manager/secrets-manager.constants';
import { SqsModule } from './sqs/sqs.module';
import { SqsHandlers } from './sqs/sqs.constants';
import { Audit } from './audit/audit.entity';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [localConfig],
      isGlobal: true,
      // validationSchema: configValidator,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<CommonConfig>) => ({
        type: 'sqlite',
        database: configService.get('DB_DATABASE'),
        logging: configService.get('DB_LOGGING'),
        synchronize: configService.get('DB_SYNCHRONIZE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
    }),
    TypeOrmModule.forFeature([Audit]),
    SecretsManagerModule,
    SnsModule,
    SqsModule,
    AwsSharedEntitiesModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AuditInterceptor,
    {
      provide: ActionHandlers,
      useFactory: (...args) => args.reduce((m, hs) => ({ ...m, ...hs }), {}),
      inject: [
        SnsHandlers,
        SqsHandlers,
        SecretsManagerHandlers,
      ],
    },
  ],
})
export class AppModule {}
