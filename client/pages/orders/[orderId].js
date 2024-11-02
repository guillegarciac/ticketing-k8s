import StripeCheckout from "react-stripe-checkout";
import { useState, useEffect } from "react";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => console.log(id)}
        stripeKey="pk_test_51QFJVbG6Heim20FSbhTqgM1uZcRAGfdBJT5nM6QJV68wymmT2b7caeof2biCykGbt6nG6s84dFObxtsnBHInkGKZ00qrNrygPA"
        amount={order.ticket.price * 100}
        email={currentUser.email}        
      ></StripeCheckout>
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
