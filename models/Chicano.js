const mongoose = require('mongoose');
const cartola = require('../utils/cartola');

const ChicanoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Por favor informe o nome do jogador'],
        trim: true,
        maxlength: [100, 'O nome nao pode ter mais do que 100 caracteres']
    },
    idTime: {
        type: Number,
        required: [true, 'Informe o ID do time no cartola'],
        trim: true,
        unique: true
    },
    timeCartola: {
        type: String
    }
},{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

ChicanoSchema.virtual('campeonatos', {
    ref: 'Campeonato',
    localField: '_id',
    foreignField: 'participantes',
    justOne: false
});

// Buscar dados no Cartola
ChicanoSchema.pre('save', async function(next){
    const retornoCartola = await cartola(process.env.CARTOLA_TIME+'/'+this.idTime);
    this.timeCartola = retornoCartola.time.nome;
    next();
});

module.exports = mongoose.model('Chicano',ChicanoSchema);