import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/api/orders', async (req: Request, res: Response) => {
  res.send('Orders post OK');
});

export { router as newOrderRouter };