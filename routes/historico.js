const express = require('express');
const { 
    createHistorico,
    deleteHistorico,
    getHistorico
} = require('../controllers/historico');

const Chicano = require('../models/Chicano');
const advancedResults = require('../middleware/advancedResults');
const { Router } = require('express');

const router = express.Router();

router
  .route('/')
  .post(createHistorico);

//outer
// .route('/')
// .get(advancedResults(Chicano,{
//                                 path:'campeonatos',
//                                 select: 'nome -participantes'
//                              }),getChicanos)
// .post(createChicano);
//
//outer
// .route('/:id')
// .get(getChicano)
// .put(updateChicano)
// .delete(deleteChicano);
//
module.exports = router;