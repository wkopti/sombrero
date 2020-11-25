var Queue = require('bull');
const verificarBase = require('../utils/verificarBase');

exports.criarFila = () => {
    var criar = new Queue('verificar base', process.env.REDIS_URI);
    criar.add({msg: "Teste"},{repeat: {cron: '*/1 * * * *'}});
} 

exports.processarFila = () =>{
    var processar = new Queue('verificar base', process.env.REDIS_URI);
    processar.process(function(job, done){
        console.log("Mensagem", job.data.msg);
        verificarBase.rodadaAtual();
        done();
    });
};