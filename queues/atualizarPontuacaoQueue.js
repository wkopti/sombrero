const dotenv = require('dotenv');
const pontuacao = require('../controllers/pontuacao');
var Queue = require('bull');

// Variaveis de ambiente
dotenv.config({ path: './config/config.env'});

var queue = new Queue('atualizar pontuacao', process.env.REDIS_URI);

exports.criarFila = (msg, inicio, fim) => {
    console.log(`Criando fila => ${inicio} / ${fim}`);
    queue.add({msg},
                {removeOnComplete: true,
                 repeat: 
                    {cron: '*/3 * * * *', 
                     starDate: inicio,
                     endDate: fim
                }});
};

exports.processarFila = () =>{
    queue.process(async job => {
        return await pontuacao.carregarPontuacaoCartola();
    });
    queue.clean(30000);
};

exports.buscarProcessosFila = async () => {
    const jobID = [];
    queue.getJobCounts().then(res => console.log('Job (atualizar pontuacao) Count:\n',res));
};

exports.retornarJobs = async (tipoJob) => {
    const jobs = await queue.getJobs();
    jobs.forEach(job => {
        console.log(job.opts)
    });
    return await queue.getJobs(tipoJob);
};