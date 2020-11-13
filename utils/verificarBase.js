const rodada = require('../controllers/rodada');
const confronto = require('../controllers/confronto');

const obterResultadoConfronto = async(confronto) => {
    //const confrontoAtualizado = await confronto.obterResultadoConfronto(confronto);
    return confrontoAtualizado;
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
    console.log('Quantas rodadas => '+rodadas.length);
    console.log('Rodada encontrada (com base na data atual) => '+ rodadaAtualData.rodada_id);
    console.log('Rodada atual carregada no banco => ' + rodadaBase.rodadaAtual);
    let msg = "Validando rodada carregada => ";
    
    if(rodadaAtualData.rodada_id === rodadaBase.rodadaAtual){
        msg = msg+"OK";
        rodadaAndamento = rodadaBase.rodadaAtual;
    } else {
        msg = msg+"NOK";
    };

    console.log(msg);

    // Confrontos
    const confrontos = await confronto.getConfrontosEmAberto(rodadaAndamento);

    if (confrontos.length > 0) {
        console.log(`Há ${confrontos.length} confrontos que precisam ser atualizados` );
        for (var i = 0; i < confrontos.length; i++){
            console.log(`Atualizar o confronto => ${confrontos[i]._id}`)
            //const confrontoAtualizado = await obterResultadoConfronto(confrontos[i]); 
        };
    };

};

module.exports = { rodadaAtual }