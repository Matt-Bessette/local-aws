import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSecretDto } from './create-secret.dto';
import { Secret } from './secret.entity';
import * as uuid from 'uuid';

@Injectable()
export class SecretService {

  constructor(
    @InjectRepository(Secret)
    private readonly secretRepo: Repository<Secret>,
  ) {}

  async findLatestByNameAndRegion(name: string, region: string): Promise<Secret> {
    return await this.secretRepo.findOne({ where: { name, region }, order: { createdAt: 'DESC' } });
  }

  async findByNameAndVersion(name: string, versionId: string): Promise<Secret> {
    // TypeORM BUG: https://github.com/typeorm/typeorm/issues/5694 - Cannot use findOne here
    const [ secret ] = await this.secretRepo.find({ where: { name, versionId } });
    return secret;
  }

  async create(dto: CreateSecretDto): Promise<Secret> {
    return await this.secretRepo.create({
      ...dto,
      versionId: dto.versionId ?? uuid.v4(),
    }).save();
  }
}
