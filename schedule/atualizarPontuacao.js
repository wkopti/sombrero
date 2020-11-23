const pontuacao = require('../controllers/pontuacao');

const atualizarPontuacao = async (schedulerPartidas) => {
    let tsAgora = new Date();
    if(!global['controleAtualizacaoPontuacao']){
        global['controleAtualizacaoPontuacao'] = true;
        const partidasEmAndamento = schedulerPartidas.filter(partida => partida.inicio.getTime() <= tsAgora.getTime() && partida.fim.getTime() >= tsAgora.getTime());
        if (partidasEmAndamento.lenght > 0) {
            //console.log('Temos jogo agora')
            let tsInicioPartida = partidasEmAndamento[0].inicio.getTime(); 
            let tsFinalPartida = partidasEmAndamento[0].getTime();
            let idJob = setInterval(() => { pontuacao.carregarPontuacaoCartola(idJob, tsInicioPartida, tsFinalPartida); }, process.env.CICLO_ATUALIZACAO_PONTUACAO);
        } else {
            //console.log('Sem jogo para acompanhar agora')
            global['controleAtualizacaoPontuacao'] = false;
        };
    };
};

module.exports = atualizarPontuacao;