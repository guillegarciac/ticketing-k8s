import { Publisher, OrderCreatedEvent, Subjects } from '@ggctickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
