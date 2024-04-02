'use strict';

module.exports = {
 up: async (queryInterface, Sequelize) => {
    // Definindo um usuário para inserir no banco de dados
    const usuario = {
      nome: 'ruan',
      usuario: 'ruan177',
      email: 'email@exemplo.com',
      senha: '123', // Certifique-se de usar uma senha segura e considerar a criptografia
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Inserindo o usuário no banco de dados
    await queryInterface.sequelize.query(
      `INSERT INTO "usuarios" ("nome","usuario", "email", "senha", "createdAt", "updatedAt") VALUES ('${usuario.nome}','${usuario.usuario}','${usuario.email}', '${usuario.senha}', NOW(), NOW())`
    );
 },

 down: async (queryInterface, Sequelize) => {
    // Removendo o usuário inserido pelo seed
    await queryInterface.sequelize.query(`DELETE FROM "usuarios" WHERE "email" = 'email@exemplo.com'`);
 }
};