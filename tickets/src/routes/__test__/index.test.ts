import request from "supertest";
import { app } from "../../app";



const createTicket = (cookie: string[], title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    });
};

it('can fetch a list of tickets', async () => {
  const cookie = global.signin();
  await createTicket(cookie, 'title1', 10);
  await createTicket(cookie, 'title2', 20);
  await createTicket(cookie, 'title3', 30);

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});