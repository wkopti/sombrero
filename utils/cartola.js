const fetch = require('node-fetch');

const consultarSite = async (url) => {
    const options = {
        method: 'GET',
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"
        }
    }

    const json = await fetch(url, options).then(res => res.json());
    return json;

};

/*
async function consultarSite(url) {
    const options = {
        method: 'GET',
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"
        }
    }

    const json = await fetch(url, options).then(res => res.json());
    return json;

};
*/

const retornaRodadas = async () => {
//async function retornaRodadas(rodadas) {
    rodadas = await consultarSite(process.env.CARTOLA_RODADAS);
    console.log(rodadas);
    return rodadas;
}


module.exports = consultarSite, retornaRodadas;