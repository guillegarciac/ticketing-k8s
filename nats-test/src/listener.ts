// Import the necessary modules from node-nats-streaming and crypto
import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { subscribe } from 'diagnostics_channel';

// Clear the console output to ensure a clean slate for logging
console.clear();

// Connect to a NATS (Node Advanced Text Services) streaming server with a unique client ID
// 'ticketing' is the name of the cluster ID for NATS
// randomBytes(4).toString('hex') generates a random client ID for this connection to ensure it's unique
// 'http://localhost:4222' is the URL where the NATS server is accessible
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

// Event listener for when the client successfully connects to the NATS server
stan.on('connect', () => {
  console.log('Listener connected to NATS');

  // Event listener for when the connection is closed, logging a message and exiting the process
  stan.on('close', () => { 
    console.log('NATS connection closed');
    process.exit();
  });

  // Set subscription options, specifically enabling manual acknowledgment mode
  // This means the server won't assume messages are delivered successfully without explicit acknowledgment
  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true) // Enable manual acknowledgment mode
    .setDeliverAllAvailable() // Retrieve all messages sent to the subject, even if they were sent before the subscription was created
    .setDurableName('orders-service'); // Ensure that the subscription is durable, so it can receive messages sent while the service was offline
  
  // Subscribe to a specific subject 'ticket:created' with a queue group name 'orders-service-queue-group'
  // This ensures that any message on 'ticket:created' is received by only one service instance in the group
  const subscription = stan.subscribe(
    'ticket:created',
    'orders-service-queue-group', // This orders-service-queue group ensures that only one instance of the service receives the message and prevents setDeliverAllAvailable from sending the message to all instances again
    options
  );

  // Event listener for receiving messages on the subscribed subject
  subscription.on('message', (msg: Message) => {
    const data = msg.getData(); // Retrieve the data from the message

    // Check if the data is in string format and log it
    if (typeof data === 'string') {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    msg.ack(); // Manually acknowledge the message, confirming it has been successfully processed
  });
});

// Event listeners for process termination signals (SIGINT, SIGTERM)
// Ensures the NATS connection is properly closed before the process exits
process.on('SIGINT', () => stan.close()); 
process.on('SIGTERM', () => stan.close()); 

abstract class Listener {
  abstract subject: string;
  abstract queueGroupName: string;
  abstract onMessage(data: any, msg: Message): void;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

    subscriptionOptions() {
      return this.client
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(this.ackWait)
        .setDurableName(this.queueGroupName);
    }

    listen() {
      const subscription = this.client.subscribe(
        this.subject,
        this.queueGroupName,
        this.subscriptionOptions()
      );

      subscription.on('message', (msg: Message) => {
        console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

        const parsedData = this.parseMessage(msg);
        this.onMessage(parsedData, msg);

      });
    }

    parseMessage(msg: Message) {
      const data = msg.getData();
      return typeof data === 'string'
        ? JSON.parse(data)
        : JSON.parse(data.toString('utf8'));
    }
}
// to run this we need to user kubectl port-forward nats-depl-67687c6fbd-l6k8c 4222:4222
// then run npm run listen