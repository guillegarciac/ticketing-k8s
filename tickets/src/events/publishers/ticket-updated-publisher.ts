import { Publisher, Subjects, TicketUpdatedEvent } from '@ggctickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
