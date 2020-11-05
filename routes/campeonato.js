const express = require('express');
const { 
    createCampeonato,
    deleteCampeonato,
    getCampeonato,
    getCampeonatos,
    updateCampeonato
} = require('../controllers/campeonato');

const Campeonato = require('../models/Campeonato');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

router
  .route('/')
  //.get(advancedResults(Campeonato,'participantes'),getCampeonatos)
  .get(advancedResults(Campeonato,{ 
                                    path:'participantes',
                                    select: 'nome idTime'
                                   }),getCampeonatos)
  .post(createCampeonato);

router
  .route('/:id')
  .get(getCampeonato)
  .put(updateCampeonato)
  .delete(deleteCampeonato);

module.exports = router;