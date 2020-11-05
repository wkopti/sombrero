const express = require('express');
const { 
    getChicanos, 
    getChicano, 
    createChicano, 
    updateChicano, 
    deleteChicano 
} = require('../controllers/chicano');

const Chicano = require('../models/Chicano');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

router
  .route('/')
  .get(advancedResults(Chicano,{
                                  path:'campeonatos',
                                  select: 'nome -participantes'
                               }),getChicanos)
  .post(createChicano);

router
  .route('/:id')
  .get(getChicano)
  .put(updateChicano)
  .delete(deleteChicano);

module.exports = router;