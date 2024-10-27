import { Listener, OrderCreatedEvent, Subjects } from '@ggctickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  onMessage(data: any, msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}