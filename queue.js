const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { queue } = require('./utils/queue');

// Variaveis de ambiente
dotenv.config({ path: './config/config.env'});

// Conexao com o banco 
connectDB();

queue.process();