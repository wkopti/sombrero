const mongoose = require('mongoose');

const CampeonatoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Por favor informe o nome do campeonato'],
        trim: true,
        unique: true,
        maxlength: [100, 'O nome nao pode ter mais do que 100 caracteres']
    },
    rodadaInicio: {
        type: Number,
        required: [true, 'Por favor informe a rodada inicial deste campeonato']
    },
    rodadaFinal: {
        type: Number
    },
    criadoEm: {
        type: Date,
        default: Date.now
    },
    participantes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chicano'
        }
    ],
    tipoCopa: {
        type: Boolean,
        default: false
    },
    qtdGrupos: {
        type: Number
    },
    qtdClassificados: {
        type: Number
    },
    jogoUnicoGrupos: {
        type: Boolean,
        description: "Havera apenas jogo unico na fase de grupos",
        default: true
    },
    jogoUnicoMataMata: {
        type: Boolean,
        description: "Havera apenas jogo unico na fase de mata mata",
        default: true
    },
    jogoUnicoFinal: {
        type: Boolean,
        description: "Havera apenas jogo unico na fase final",
        default: true
    },
    sorteioRealizado: {
        type: Boolean,
        default: false
    },
    grupos: [{
        nomeGrupo: {
            type: String
        },
        participantes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Chicano'
            }
        ],
        confrontos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Confronto'
            }
        ]
    }],
    encerrado: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Campeonato',CampeonatoSchema);