import amqplib from 'amqplib';

const queue = 'tasks';
const conn = await amqplib.connect('amqp://localhost');

const ch1 = await conn.createChannel();
await ch1.assertQueue(queue);

const ch2 = await conn.createChannel();
export { 
  ch1,
  ch2,
  queue,
}
