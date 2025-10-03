// @ts-ignore
import amqp from "amqplib";

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async () => {
  const maxRetries = 5;
  const retryDelay = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
      console.log(`🔄 RabbitMQ connection attempt ${attempt}/${maxRetries}...`);

      connection = await amqp.connect(rabbitmqUrl);
      channel = await connection.createChannel();

      await channel.assertExchange("user_events", "topic", { durable: true });
      await channel.assertExchange("recipe_events", "topic", { durable: true });

      const userQueue = await channel.assertQueue(
        "content_service_user_events",
        { durable: true }
      );
      await channel.bindQueue(userQueue.queue, "user_events", "user.updated");

      console.log("✅ Content Service connected to RabbitMQ");

      channel.consume(userQueue.queue, (msg: any) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            console.log("📥 Received user event:", event.type);
            channel.ack(msg);
          } catch (error: any) {
            console.error("Error processing user event:", error.message);
            channel.nack(msg);
          }
        }
      });

      return channel;
    } catch (error: any) {
      console.error(
        `❌ RabbitMQ connection attempt ${attempt} failed:`,
        error.message
      );

      if (attempt === maxRetries) {
        throw error;
      }

      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

export const publishToExchange = async (
  exchange: string,
  routingKey: string,
  message: any
) => {
  try {
    if (!channel) {
      console.log(
        "⚠️ RabbitMQ channel not available, skipping event publishing"
      );
      return;
    }
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      }
    );
    console.log(`📤 Event published: ${exchange} - ${routingKey}`);
  } catch (error: any) {
    console.error("Error publishing event:", error.message);
  }
};
