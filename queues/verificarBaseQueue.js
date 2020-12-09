const dotenv = require('dotenv');
const verificarBase = require('../utils/verificarBase');
var Queue = require('bull');

// Variaveis de ambiente
dotenv.config({ path: './config/config.env'});

var queue = new Queue('verificar base', process.env.REDIS_URI);

const options = {
    repeat: {cron: '*/1 * * * *'}
};

exports.criarFila = async () => {
    let jobs = await queue.getJobs();
    //console.log("antes jobs",jobs);
    queue.removeJobs();
    jobs = await queue.getJobs();
    //console.log("depois jobs",jobs);

    //queue.add({msg: "Verificar a base"},options);
} 

exports.processarFila = () =>{
    queue.process(async job => {
        console.log('teste')
        return await verificarBase.rodadaAtual();
    });
    queue.clean(30000);
};

exports.buscarProcessosFila = async () => {
    const jobID = [];
    queue.getJobCounts().then(res => console.log('Job (verificarBase) Count:\n',res));
    //const teste = await queue.getJobs();//.then(res => res  console.log(res));
    //queue.removeJobs()
    //console.log(teste[0]);
}

exports.queue = queue;