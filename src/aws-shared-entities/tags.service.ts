import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tags.entity';
import { CreateTagDto } from './create-tag.dto';

@Injectable()
export class TagsService {

  constructor(
    @InjectRepository(Tag)
    private readonly repo: Repository<Tag>,
  ) {}

  async getByArn(arn: string): Promise<Tag[]> {
    return await this.repo.find({ where: { arn }});
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    return await this.repo.save(dto);
  }

  async createMany(arn: string, records: { Key: string, Value: string }[]): Promise<void> {
    for (const record of records) {
      await this.create({ arn, name: record.Key, value: record.Value });
    }
  }

  async deleteByArnAndName(arn: string, name: string) {
    await this.repo.delete({ arn, name });
  }

  static tagPairs(queryParams: Record<string, string>): { Key: string, Value: string }[] {
    const pairs = [null];
    for (const param of Object.keys(queryParams)) {
      const [type, _, idx, slot] = param.split('.');

      if (type === 'Tags') {
        if (!pairs[+idx]) {
          pairs[+idx] = { Key: '', Value: ''};
        }
        pairs[+idx][slot] = queryParams[param];
      }
    }

    pairs.shift();
    return pairs;
  }

  static getXmlSafeAttributesMap(tags: Tag[]) {
    return { Tags: { member: tags.map(({ name, value }) => ({ Key: name, Value: value })) } };
  }
}
