import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SqsQueue } from './sqs-queue.entity';
import * as uuid from 'uuid';

type QueueEntry = {
  id: string;
  queueArn: string;
  senderId: string;
  message: string;
  inFlightReleaseDate: Date;
  createdAt: Date;
}

@Injectable()
export class SqsQueueEntryService {

  // Heavy use may require event-driven locking implementation
  private queues: Record<string, QueueEntry[]> = {};

  constructor(
    @InjectRepository(SqsQueue)
    private readonly sqsQueueRepo: Repository<SqsQueue>,
  ) {}

  async publish(accountId: string, queueName: string, message: string) {
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId, name: queueName }});

    if (!queue) {
      console.warn(`Warning bad subscription to ${queueName}`);
      return;
    }

    if (this.queues) {
      this.queues[queue.arn] = [];
    }

    this.queues[queue.arn].push({ 
      id: uuid.v4(),
      queueArn: queue.arn,
      senderId: accountId,
      message,
      inFlightReleaseDate: new Date(),
      createdAt: new Date(),
    });
  }

  async recieveMessages(accountId: string, queueName: string, maxNumberOfMessages = 10, visabilityTimeout = 0): Promise<QueueEntry[]> {
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId, name: queueName }});

    if (!queue) {
      throw new BadRequestException();
    }

    const accessDate = new Date();
    const newInFlightReleaseDate = new Date(accessDate);
    newInFlightReleaseDate.setSeconds(accessDate.getSeconds() + visabilityTimeout);
    const records = this.queues[queue.arn]?.filter(e => e.inFlightReleaseDate <= accessDate).slice(0, maxNumberOfMessages - 1);
    records.forEach(e => e.inFlightReleaseDate = newInFlightReleaseDate);
    return records;
  }

  async purge(accountId: string, queueName: string) {
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId, name: queueName }});
    this.queues[queue.arn] = [];
  }
}
