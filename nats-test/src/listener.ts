// Import the necessary modules from node-nats-streaming and crypto
import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { subscribe } from "diagnostics_channel";

// Clear the console output to ensure a clean slate for logging
console.clear();

// Connect to a NATS (Node Advanced Text Services) streaming server with a unique client ID
// 'ticketing' is the name of the cluster ID for NATS
// randomBytes(4).toString('hex') generates a random client ID for this connection to ensure it's unique
// 'http://localhost:4222' is the URL where the NATS server is accessible
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

// Event listener for when the client successfully connects to the NATS server
stan.on("connect", () => {
  console.log("Listener connected to NATS");

  // Event listener for when the connection is closed, logging a message and exiting the process
  stan.on("close", () => {
    console.log("NATS connection closed");
    process.exit();
  });

  new TicketCreatedListener(stan).listen();

});

// Event listeners for process termination signals (SIGINT, SIGTERM)
// Ensures the NATS connection is properly closed before the process exits
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());

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

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}

class TicketCreatedListener extends Listener {
  subject = "ticket:created";
  queueGroupName = "payments-service";

  onMessage(data: any, msg: Message) {
    console.log("Event data!", data);

    msg.ack();
  }
}

// to run this we need to user kubectl port-forward nats-depl-67687c6fbd-l6k8c 4222:4222
// then run npm run listen
