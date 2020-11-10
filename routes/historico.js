const express = require('express');
const { 
    createHistorico,
    deleteHistorico,
    getHistorico
} = require('../controllers/historico');

const Historico = require('../models/Historico');
const advancedResults = require('../middleware/advancedResults');
//const { Router } = require('express');

const router = express.Router();

router
  .route('/')
  .post(createHistorico);

router
  .route('/:idChicano')
  .get(advancedResults(Historico),getHistorico);

router
  .route('/:idChicano/:idRodada')
  .get(advancedResults(Historico),getHistorico);

module.exports = router;