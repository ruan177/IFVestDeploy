'use strict';

const { Topico } = require('../models');

module.exports = {
 up: async (queryInterface, Sequelize) => {
    try {
      await Topico.create({
        materia: 'Tópico de Exemplo',
        areaId: 1,

        createdAt: new Date(),
        updatedAt: new Date()
        // Adicione outros campos conforme necessário
      });
      console.log('Seed de tópico criada com sucesso!');
    } catch (error) {
      console.error('Erro ao executar a seed de tópico:', error);
    }
 },

 down: async (queryInterface, Sequelize) => {
    try {
      await Topico.destroy({
        where: {
          titulo: 'Tópico de Exemplo',
        },
      });
      console.log('Seed de tópico revertida com sucesso!');
    } catch (error) {
      console.error('Erro ao reverter a seed de tópico:', error);
    }
 },
};