import { CreateTopicCommand, CreateTopicCommandOutput, GetSubscriptionAttributesCommand, GetTopicAttributesCommand, ListTagsForResourceCommand, ListTopicsCommand, PublishCommand, SNSClient, SubscribeCommand, SubscribeCommandOutput } from '@aws-sdk/client-sns';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../aws-shared-entities/tags.entity';
import { SnsTopicSubscription } from '../sns-topic-subscription.entity';
import { SnsTopic } from '../sns-topic.entity';

describe('SNS Module', () => {

  let snsClient: SNSClient;

  beforeAll(async () => {
    snsClient = new SNSClient({
      endpoint: globalThis.__ENDPOINT__,
    });
  });

  const describeCleanup = async () => {
    const testModule: TestingModule = globalThis.__TESTMODULE__;
    
    const snsTopicRepo = testModule.get<Repository<SnsTopic>>(getRepositoryToken(SnsTopic));
    await snsTopicRepo.delete({});

    const subscriptionRepo = testModule.get<Repository<SnsTopicSubscription>>(getRepositoryToken(SnsTopicSubscription));
    await subscriptionRepo.delete({});

    const tagsRepo = testModule.get<Repository<Tag>>(getRepositoryToken(Tag));
    await tagsRepo.delete({});
  };

  describe('creation', () => {

    afterAll(describeCleanup);

    it('can create a topic', async () => {
      const response = await snsClient.send(new CreateTopicCommand({
        Name: 'test-topic-1',
      }));

      expect(response.TopicArn).toBe('arn:aws:sns:us-east-1:000000000000:test-topic-1');
    });

    it('can subscribe', async () => {

      const topicResponse = await snsClient.send(new CreateTopicCommand({
        Name: 'test-topic-2',
      }));

      const response = await snsClient.send(new SubscribeCommand({
        TopicArn: topicResponse.TopicArn,
        Protocol: 'https',
        Endpoint: 'https://google.com',
      }));

      expect(response.SubscriptionArn).toBeDefined();
    });

    it('can publish', async () => {

      const topicResponse = await snsClient.send(new CreateTopicCommand({
        Name: 'test-topic-3',
      }));

      const response = await snsClient.send(new PublishCommand({
        Message: "hello world",
        TopicArn: topicResponse.TopicArn,
      }));

      expect(response.MessageId).toBeDefined();
    });
  });

  describe('reading', () => {

    afterAll(describeCleanup);

    let subscribedTopic: CreateTopicCommandOutput;
    let subscription: SubscribeCommandOutput;

    beforeAll(async () => {
      subscribedTopic = await snsClient.send(new CreateTopicCommand({
        Name: 'test-topic-4',
        Tags: [{ Key: 'V_a', Value: 'a' }, { Key: 'V_b', Value: 'b', }]
      }));

      await snsClient.send(new CreateTopicCommand({
        Name: 'test-topic-5',
      }));

      await snsClient.send(new CreateTopicCommand({
        Name: 'test-topic-6',
      }));

      subscription = await snsClient.send(new SubscribeCommand({
        TopicArn: subscribedTopic.TopicArn,
        Protocol: 'https',
        Endpoint: 'https://google.com',
      }));
    });

    it('can get subscription attributes', async () => {
      const response = await snsClient.send(new GetSubscriptionAttributesCommand({
        SubscriptionArn: subscription.SubscriptionArn,
      }));

      expect(response.Attributes).toEqual(expect.objectContaining({
        "ConfirmationWasAuthenticated": "true",
        "PendingConfirmation": "false",
        "Owner": "000000000000",
        "SubscriptionArn": subscription.SubscriptionArn,
        "TopicArn": subscribedTopic.TopicArn,
        "TracingConfig": "PassThrough"
      }));
    });

    it('can get topic attributes', async () => {

      const response = await snsClient.send(new GetTopicAttributesCommand({
        TopicArn: subscribedTopic.TopicArn,
      }));

      expect(response.Attributes).toEqual(expect.objectContaining({
        "DisplayName": 'test-topic-4',
        "Owner": "000000000000",
        "SubscriptionsConfirmed": "1",
        "SubscriptionsDeleted": "0",
        "SubscriptionsPending": "0",
        "TopicArn": subscribedTopic.TopicArn,
        "TracingConfig": "PassThrough"
      }));
    });

    it('can list tags for resource', async () => {

      const response = await snsClient.send(new ListTagsForResourceCommand({
        ResourceArn: subscribedTopic.TopicArn,
      }));

      expect(response.Tags).toHaveLength(2);

      const map = new Map(response.Tags.map(({ Key, Value }) => [ Key, Value ]));
      expect(map.get('V_a')).toBe('a');
      expect(map.get('V_b')).toBe('b');
    });

    it('can list all topics', async () => {
      const response = await snsClient.send(new ListTopicsCommand({}));
      expect(response.Topics).toHaveLength(3);
    });

  });

  // describe('updating', () => {

  //   afterAll(describeCleanup);

  // });

  // describe('deleting', () => {

  //   afterAll(describeCleanup);

  // });
});
