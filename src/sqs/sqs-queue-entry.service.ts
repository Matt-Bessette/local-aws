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

type Metrics = { total: number, inFlight: number}

const FIFTEEN_SECONDS = 15 * 1000;

@Injectable()
export class SqsQueueEntryService {

  // Heavy use may require event-driven locking implementation
  private queues: Record<string, QueueEntry[]> = {};

  private queueObjectCache: Record<string, [Date, SqsQueue]> = {};

  constructor(
    @InjectRepository(SqsQueue)
    private readonly sqsQueueRepo: Repository<SqsQueue>,
  ) {}

  async findQueueByAccountIdAndName(accountId: string, name: string): Promise<SqsQueue> {
    return await this.sqsQueueRepo.findOne({ where: { accountId, name } });
  }

  metrics(queueArn: string): Metrics {

    const now = new Date();
    return this.getQueueList(queueArn).reduce<Metrics>((acc, e) => {
      acc.total += 1;
      acc.inFlight += e.inFlightReleaseDate > now ? 1 : 0;
      return acc;
    }, { total: 0, inFlight: 0 });
  }

  async publish(accountId: string, queueName: string, message: string) {
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId, name: queueName }});

    if (!queue) {
      console.warn(`Warning bad subscription to ${queueName}`);
      return;
    }

    this.getQueueList(queue.arn).push({ 
      id: uuid.v4(),
      queueArn: queue.arn,
      senderId: accountId,
      message,
      inFlightReleaseDate: new Date(),
      createdAt: new Date(),
    });
  }

  async recieveMessages(accountId: string, queueName: string, maxNumberOfMessages = 10, visabilityTimeout = 0): Promise<QueueEntry[]> {

    if (!this.queueObjectCache[`${accountId}/${queueName}`] || this.queueObjectCache[`${accountId}/${queueName}`][0] < new Date()) {
      this.queueObjectCache[`${accountId}/${queueName}`] = [new Date(Date.now() + FIFTEEN_SECONDS), await this.sqsQueueRepo.findOne({ where: { accountId, name: queueName }})];
    }

    const [_, queue] = this.queueObjectCache[`${accountId}/${queueName}`];

    if (!queue) {
      throw new BadRequestException('Queue not found');
    }

    const accessDate = new Date();
    const newInFlightReleaseDate = new Date(accessDate);
    newInFlightReleaseDate.setSeconds(accessDate.getSeconds() + visabilityTimeout);
    const records = this.getQueueList(queue.arn).filter(e => e.inFlightReleaseDate <= accessDate).slice(0, maxNumberOfMessages - 1);
    records.forEach(e => e.inFlightReleaseDate = newInFlightReleaseDate);
    return records;
  }

  async purge(accountId: string, queueName: string) {
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId, name: queueName }});
    this.queues[queue.arn] = [];
  }

  private getQueueList(arn: string): QueueEntry[] {
    
    if (!this.queues[arn]) {
      this.queues[arn] = [];
    }

    return this.queues[arn];
  }
}
