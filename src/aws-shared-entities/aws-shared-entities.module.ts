import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './attributes.entity';
import { AttributesService } from './attributes.service';
import { Tag } from './tags.entity';
import { TagsService } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute, Tag])],
  providers: [AttributesService, TagsService],
  exports: [AttributesService, TagsService],
})
export class AwsSharedEntitiesModule {}
