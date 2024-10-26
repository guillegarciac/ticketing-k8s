import { Publisher, OrderCancelledEvent, Subjects } from '@ggctickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

