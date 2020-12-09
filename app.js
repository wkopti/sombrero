const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
//const logger = require('./middleware/logger');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const { queue } = require('./utils/queue');

// Variaveis de ambiente
dotenv.config({ path: './config/config.env'});

// Conexao com o banco
connectDB();

// Verificacao da base
queue.add('verificarBase');

// Arquivos de rota
const chicano = require('./routes/chicano');
const campeonato = require('./routes/campeonato');
const historico = require('./routes/historico');
const confronto = require('./routes/confronto');
const pontuacao = require('./routes/pontuacao');

const app = express();

// Body parser
app.use(express.json());

app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

// Dev logging middleware
if(process.env.NODE_ENV === 'dev') {
    app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Seguranca
app.use(helmet());

// XSS attack
app.use(xss());

//app.use(logger);

// Rotas
app.use('/api/v1/chicano', chicano);
app.use('/api/v1/campeonato', campeonato);
app.use('/api/v1/historico', historico);
app.use('/api/v1/confronto',confronto);
app.use('/api/v1/pontuacao',pontuacao);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(`Rodando em ${process.env.NODE_ENV} na porta ${PORT}`)
);

// Handle erros
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error:${err.message} `);
    server.close(() => process.exit(1));
})