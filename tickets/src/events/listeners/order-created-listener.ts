import { Listener, OrderCreatedEvent, Subjects } from '@ggctickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';

export class TicketCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}


