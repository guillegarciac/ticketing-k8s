import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new Ticket().id,
    title: 'Concert',
    price: 20
  });
  await ticket.save();

  return ticket;
}

it ('fetches the order', async () => {
  // Create a ticket
  const ticket = await buildTicket();

  const user = global.signin();

  // Create one order as User #1
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to get orders for User #1
  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(200);

  expect(response.body.id).toEqual(order.id);
  expect(response.body.ticket.id).toEqual(ticket.id);
});