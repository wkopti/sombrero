const rodada = require('../controllers/rodada');
const confronto = require('../controllers/confronto');
const campeonato = require('../controllers/campeonato'); 

async function atualizarConfronto(confrontoAtual) {
    const atualizado = await confronto.obterResultadoConfronto(confrontoAtual);
    return atualizado;
};

const rodadaAtual = async() => {
    const rodadaBase = await rodada.retornarRodada();
    //const dataAtual = Math.trunc(Date.now()/1000);
    const dataAtual = new Date;
    let rodadaAndamento;
    let rodadas = []
    
    rodadaBase.rodadas.forEach(element => {
        rodadas.push(element);
    });

    const rodadaAtualData = rodadas.find(r => dataAtual.getTime() <= r.inicio.getTime()) ;

    console.log('Data atual => '+dataAtual);
    console.log('Timestamp da data atual => '+dataAtual.getTime());
    console.log('Quantas rodadas => '+rodadas.length);
    console.log('Rodada encontrada (com base na data atual) => '+ rodadaAtualData.rodada_id);
    console.log('Timestamp do inicio da rodada encontrada (com base na data atual) => '+ rodadaAtualData.inicio.getTime());
    console.log('Rodada atual carregada no banco => ' + rodadaBase.rodadaAtual);
    
    let msg = "Validando rodada carregada => ";
    
    // Se a rodada esta correta
    if(rodadaAtualData.rodada_id === rodadaBase.rodadaAtual){
        msg = msg+"OK";
        rodadaAndamento = rodadaBase.rodadaAtual;
    } else {
        // Se a rodada esta incorreta, mas ainda nao comecou a proxima rodada entao a rodada esta em andamento
        if (dataAtual.getTime() <= rodadaAtualData.inicio.getTime()){
            rodadaAndamento = rodadaBase.rodadaAtual;
            msg = msg+"Rodada em andamento";
            // Quais sao as partidas que valem para o cartola?
            const partidasValidas = await rodada.retornarPartidasValidas();
            // Quais sao as partidas que faltam na rodada?
            const partidasEmAberto = await rodada.retornarPartidasEmAberto();
            // Disparar o scheduler das partidas com tempos em comum das partidas em aberto
            console.log(partidasEmAberto)
            // O scheduler de cada partida deve

        } else {
            // Devemos deletar o que temos e carregar a nova rodada
            msg = msg+"NOK";
        };
    };

    console.log(msg);

    // Confrontos
    const confrontos = await confronto.getConfrontosEmAberto(rodadaAndamento);

    if (confrontos.length > 0) {
        console.log(`Há ${confrontos.length} confrontos que precisam ser atualizados` );
        for (var i = 0; i < confrontos.length; i++){
            console.log(`Atualizar o confronto => ${confrontos[i]._id}`)
            confrontos[i] = await atualizarConfronto(confrontos[i]);
        };
    };

    // Campeonatos
    const campeonatos = await campeonato.getCampeonatosEmAberto();
    //console.log(campeonatos)
    if (campeonatos.length > 0){

        for (let index = 0; index < campeonatos.length; index++) {
            const campeonatoAberto = campeonatos[index];
    
            if(campeonatoAberto.tipoCopa === true && campeonatoAberto.faseGruposEncerrada === false){
                const confrontoAberto = [];
                campeonatoAberto.grupos.forEach(grupo => {
                    grupo.confrontos.forEach(confronto => {
                        if (confronto.encerrado === false){
                            confrontoAberto.push(confronto);
                        };
                    });
                });
                
                // Se nao tem mais jogos na fase de grupos
                if (confrontoAberto.length === 0){
                    // Encerrar a fase de grupos
                    campeonatoAberto.faseGruposEncerrada = true;
                    console.log('------')
                    console.log(await campeonato.getClassificaoGrupos(campeonatoAberto));
                    // Devemos gerar o Mata Mata

                    //campeonatoAberto.save();
                };
            };
        };

        //const campeonatosPontoCorrido = campeonatos.find(campeonato => campeonato.tipoCopa === false);
        //const campeonatosCopa = campeonatos.find(campeonato => campeonato.tipoCopa === true);

    };
    console.log(`Há ${campeonatos.length} campeonato em aberto`);

};

module.exports = { rodadaAtual }