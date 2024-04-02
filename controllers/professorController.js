const { Router } = require('express');
const { Usuario } = require('../models');
const { Favorito } = require('../models');
const { Topico } = require('../models');
const { Simulados } = require('../models');
const { Questões } = require('../models');
const { Area } = require('../models');
const { PerguntasProvas } = require('../models');
const { Resposta } = require('../models');
const { Op } = require('sequelize');
const roteador = Router()


roteador.get('/registrar-questao/:tipo', async (req, res) => {
  if (!req.session.login) {
    return res.status(401).redirect('/usuario/login');
  }
  const tipo = req.params.tipo.toLowerCase();
  const usuarioId = req.session.idUsuario;
  const Topicos = await Topico.findAll();

  // Mapeamento dos tipos de questões aos tipos de simulados
  const tipoSimuladoMap = {
    "objetiva": ['ALEATORIO', 'OBJETIVO'],
    "dissertativa": ['DISSERTATIVO', 'ALEATORIO']
  };

  // Verifica se o tipo de questão é válido
  if (!tipoSimuladoMap[tipo]) {
    return res.status(400).send('Tipo de questão inválido');
  }

  // Consulta todos os simulados do usuário, filtrando por tipo
  const simulados = await Simulados.findAll({
    where: {
      usuarioId: usuarioId,
      tipo: {
        [Op.in]: tipoSimuladoMap[tipo]
      }
    }
  });

  // Retorna os simulados filtrados
  res.status(200).render('professor/registroPergunta', { Topicos, tipo, simulados });
});

roteador.get('/questoes', async (req, res) => {
  const usuarioId = req.session.idUsuario;
  try {

    const questoes = await Questões.findAll({
      where: {
        usuarioId: usuarioId
      }
    });

    res.status(200).render('professor/questoes', {questoes})

  } catch (err) {
    req.sesssion.destroy();
    res.status(500).redirect('/usuario/inicioLogado');
  };

});

roteador.get('/editar-questao/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const questao = await Questões.findByPk(id);
      if (!questao) {
          return res.status(404).send('Questão não encontrada');
      }
      res.render('professor/editar-questao', { questao });
  } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar questão');
  }

});
roteador.patch('/editar-questao', async (req, res) => {
   const { id, titulo, pergunta } = req.body;
  try {
      const questao = await Questões.findByPk(id);
      if (!questao) {
          return res.status(404).send('Questão não encontrada');
      }
      questao.titulo = titulo;
      questao.pergunta = pergunta;
      await questao.save();
      res.redirect('/professor/questoes'); 
  } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar questão');
  }
});




// precisa testar pra ver se funciona
roteador.post('/registrar-questao/:tipo', async (req, res) => {
  try {
    const { pergunta, topicoId, titulo, respostas, simuladoId } = req.body;
    const tipo = req.params.tipo;
    const usuarioId = req.session.idUsuario;

    // Função para criar a questão e associar ao simulado
    const criareAssociarQuestao = async (resposta) => {
      const questao = await Questões.create({
        pergunta,
        titulo,
        topicoId,
        usuarioId,
        resposta
      });

      if (simuladoId) {
        const simulado = await Simulados.findByPk(simuladoId);
        await simulado.addQuestões(questao);
      }
    };

    if (tipo === "objetiva") {
      const respostaConcatenada = respostas.join('_');
      await criareAssociarQuestao(respostaConcatenada);
    } else if (tipo === "dissertativa") {
      await criareAssociarQuestao(" ");
    } else {
      throw new Error("Tipo de questão inválido");
    }

    res.status(201).redirect('/usuario/inicioLogado');
  } catch (error) {
    console.error(error);
    res.status(500).redirect('/usuario/inicioLogado');
  }
});
module.exports = roteador;