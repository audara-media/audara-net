import amqplib from 'amqplib';

const queue = 'tasks';
let conn;
try {
  console.log('Connecting to RabbitMQ', process.env.RABBITMQ_SERVER);
  conn = await amqplib.connect(process.env.RABBITMQ_SERVER || 'amqp://localhost');
  console.log('Connected to RabbitMQ');
} catch (error) {
  console.error('Error connecting to RabbitMQ:', error);
  process.exit(1);
}

const ch1 = await conn.createChannel();
await ch1.assertQueue(queue);

const ch2 = await conn.createChannel();
export { 
  ch1,
  ch2,
  queue,
}
