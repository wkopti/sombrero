const Queue = require('bull');
const jobs = require('../jobs');
const dotenv = require('dotenv');

// Variaveis de ambiente
dotenv.config({ path: './config/config.env'});

const queues = Object.values(jobs).map(job => (
    Object.values(job)
      .map(atributos => (
          { bull: new Queue(atributos.key, process.env.REDIS_URI),
            name: atributos.key,
            options: atributos.options,
            handle: atributos.handle  
          }))
)).flat();

exports.queue = {
    queues,
    add(name, data, inicio, fim) {
        const queue = this.queues.find(queue => queue.name === name);
        if (inicio && fim) {
            queue.options = {
                repeat: {
                    cron: '*/1 * * * *',
                    startDate: inicio,
                    endDate: fim
                }
            }
        }
        return queue.bull.add(data, queue.options);
    },
    process() {
        return this.queues.forEach(queue => {
            queue.bull.process(queue.handle);
            queue.bull.on('failed', (job, err) => {
            console.log('Job failed', queue.key, job.data);
            console.log(err);
        });
    })}
};