import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute } from './attributes.entity';
import { CreateAttributeDto } from './create-attribute.dto';

const ResourcePolicyName = 'ResourcePolicy';

@Injectable()
export class AttributesService {

  constructor(
    @InjectRepository(Attribute)
    private readonly repo: Repository<Attribute>,
  ) {}

  async getByArn(arn: string): Promise<Attribute[]> {
    return await this.repo.find({ where: { arn }});
  }

  async getResourcePolicyByArn(arn: string): Promise<Attribute> {
    return await this.repo.findOne({ where: { arn, name: ResourcePolicyName }});
  }

  async createResourcePolicy(arn: string, value: string): Promise<Attribute> {
    return await this.create({arn, value, name: ResourcePolicyName });
  }

  async create(dto: CreateAttributeDto): Promise<Attribute> {
    return await this.repo.save(dto);
  }

  async deleteByArn(arn: string) {
    await this.repo.delete({ arn });
  }

  async deleteByArnAndName(arn: string, name: string) {
    await this.repo.delete({ arn, name });
  }

  async createMany(arn: string, records: { key: string, value: string }[]): Promise<void> {
    for (const record of records) {
      await this.create({ arn, name: record.key, value: record.value });
    }
  }

  static attributePairs(queryParams: Record<string, string>): { key: string, value: string }[] {
    const pairs = [null];
    for (const param of Object.keys(queryParams)) {
      const [type, _, idx, slot] = param.split('.');

      if (type === 'Attributes') {
        if (!pairs[+idx]) {
          pairs[+idx] = { key: '', value: ''};
        }
        pairs[+idx][slot] = queryParams[param];
      }
    }

    pairs.shift();
    return pairs;
  }

  static getXmlSafeAttributesMap(attributes: Record<string, string>) {
    return { Attributes: { entry: Object.keys(attributes).map(key => ({ key, value: attributes[key] })) } }
  }
}
