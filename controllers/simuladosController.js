const { Router } = require('express');
const { Usuario } = require('../models');
const { Favorito } = require('../models');
const { Topico } = require('../models');
const { Simulados } = require('../models');
const { Questões } = require('../models');
const { Area } = require('../models');
const { PerguntasProvas } = require('../models');
const { Resposta } = require('../models');
const roteador = Router()
const { Op } = require('sequelize');

// Rota para visualizar questionários
roteador.get('/', async (req, res) => {
  try {
    const idUsuario = req.session.idUsuario
    const simulados = await Simulados.findAll({
      where: {
        usuarioId: idUsuario
      }
    }); // Supondo que você tenha um modelo "Provas"

    res.render('simulado/meusSimulados', { simulados });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocorreu um erro ao recuperar os questionários.');
  }
});

// Rota para visualizar questionários
roteador.get('/visualizar/:tipo', async (req, res) => {
  try {
    const tipo = req.params.tipo.toUpperCase();
    const tiposPermitidos = ['DISSERTATIVO', 'OBJETIVO', 'ALEATORIO'];

    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).send('Tipo de simulado inválido.');
    }

    const simulados = await Simulados.findAll({
      where: {
        tipo: tipo
      },
      include: Questões
    });

    //  res.send(JSON.stringify(simulados))
    res.render('simulado/simulados', { simulados });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocorreu um erro ao recuperar os questionários.');
  }
});

// Rota para associar uma pergunta a um questionário (formulário)
roteador.get('/:simuladoId/editar', async (req, res) => {
  try {
    const simuladoId = req.params.simuladoId;
    const simulado = await Simulados.findOne({
      where: {
        id: simuladoId
      },
      include: [
        {model: Questões,
        as: 'Questões'}
      ]
    });

    res.render('prova/editarsimulado', { simulado   });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar formulário de associação de pergunta');
  }
});

roteador.get('/:simuladoId/adicionar-questoes', async (req, res) => {
  try {
    const simuladoId = req.params.simuladoId;
    const { pergunta } = req.query; // Obtem o texto de filtragem do query string

    const simulado = await Simulados.findOne({
      where: {
        id: simuladoId
      },
      include: [
        {
          model: Questões,
          as: 'Questões'
        }
      ]
    });

    // Obtém os IDs das questões já associadas ao simulado
    const questoesAssociadasIds = simulado.Questões.map(questao => questao.id);

    console.log(questoesAssociadasIds)

    let questoes;
    if (pergunta) {
        // Se houver um texto de pesquisa, filtra as questões que contêm o texto de filtragem
        questoes = await Questões.findAll({
          where: {
            id: {
              [Op.notIn]: questoesAssociadasIds // Exclui as questões já associadas
            },
            pergunta: {
              [Op.like]: '%' + pergunta + '%' // Filtra questões que contêm o texto de filtragem
            }
          },
          include: [{
            model: Topico,
            as: 'Topico' // Ajuste conforme necessário, dependendo de como você configurou a associação
          }]
        });
    } else {
        // Se não houver um texto de pesquisa, retorna todas as questões disponíveis
        questoes = await Questões.findAll({
          where: {
            id: {
              [Op.notIn]: questoesAssociadasIds // Exclui as questões já associadas
            }
          },
          include: [{
            model: Topico,
            as: 'Topico' // Ajuste conforme necessário, dependendo de como você configurou a associação
          }]
        });
    }

    res.render('prova/associarperguntasimulado', { simulado, questoes });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar formulário de associação de pergunta');
  }
});

//   // Importe os modelos necessários e quaisquer outras dependências que você precise


//   //rota testa e funciona
//   // Rota para processar o formulário de associação de pergunta a questionário
  roteador.post('/:simuladoId/adicionar-questoes', async (req, res) => {
    try {
      const { simuladoId } = req.params;
      const { questoesSelecionadas } = req.body;

      // Primeiro, verifique se o questionário e a pergunta existem
      const simulado = await Simulados.findByPk(simuladoId);
     
      if (!simulado) {
        return res.status(404).send('Simulado não encontrado.');
      }
      if (!questoesSelecionadas) {
        return res.status(404).send('Questões não selecionadas.');
      }
  
      // Agora, associe as questões ao simulado usando o método addQuestões
      // Este método deve ser definido em sua associação Sequelize entre Simulados e Questões
      await simulado.addQuestões(questoesSelecionadas);
  

      res.redirect(`/usuario/simulados/`);
    } catch (error) {
      console.error('Erro ao associar Questões a questionário:', error);
      res.status(500).send('Erro ao associar Questões a questionário.');
    }
  });

  roteador.delete('/:simuladoId/remover-questoes', async (req, res) => {
    try {
        const { simuladoId } = req.params;
        const { questoesSelecionadas } = req.body;

        // Primeiro, verifique se o simulado existe
        const simulado = await Simulados.findByPk(simuladoId, {
          include: [{
              model: Questões,
              as: 'Questões'
          }]
      });

        if (!simulado) {
            return res.status(404).send('Simulado não encontrado.');
        }
        if (!questoesSelecionadas || questoesSelecionadas.length === 0) {
            return res.status(404).send('Questões não selecionadas.');
        }

        // Agora, remova as questões do simulado usando o método removeQuestoes
        // Este método é fornecido pelo Sequelize para associações belongsToMany
        await simulado.removeQuestões(questoesSelecionadas);

        res.redirect(`/usuario/simulados/`);
    } catch (error) {
        console.error('Erro ao remover Questões do questionário:', error);
        res.status(500).send('Erro ao remover Questões do questionário.');
    }
});


//   // Rota para processar as respostas do questionário
//   // Rota para uma prova com alternativas
roteador.get('/:simuladoId/fazer', async (req, res) => {
  try {
    const simuladoId = req.params.simuladoId;

    // Busque as perguntas da prova específica usando o modelo PerguntasProvas
    const perguntasProvas = await PerguntasProvas.findAll({
      where: { provaId: simuladoId },
    });
    console.log("perguntas:", perguntasProvas)

    // Crie um array para armazenar os detalhes das perguntas
    const perguntas = [];

    // Para cada entrada em perguntasProvas, busque os detalhes da pergunta usando o modelo Questões
    for (const perguntaProva of perguntasProvas) {
      const perguntaDetalhe = await Questões.findByPk(perguntaProva.QuestõesId);
      perguntas.push(perguntaDetalhe);
    }

    const prova = await Simulados.findByPk(simuladoId);
    console.log("prova:", prova)

    // Verifique se o simulado foi encontrado e inclua o tipo de prova na resposta
    if(prova){
      res.render('prova/prova', { perguntas, prova, tipo: prova.tipo });
    }else{
      res.status(404).send('Simulado não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao buscar perguntas da prova:', error);
    res.status(500).send('Erro ao buscar perguntas da prova.');
  }
});

roteador.post('/responder-prova/:provaId', async (req, res) => {
  const { respostas } = req.body;
  const { idUsuario } = req.session;
  const { provaId } = req.params;
  const respostaConcatenada = respostas.join(',');

  try {
    await Resposta.create({
      resposta: respostaConcatenada,
      usuarioId: idUsuario,
      provaId,
    });

    return res.redirect('/usuario/inicioLogado');
  } catch (error) {
    console.error('Erro ao salvar respostas associadas:', error);
    return res.status(500).send('Erro ao salvar respostas associadas.');
  }
});
function formatBrazilianDate(date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  

  roteador.post('/search', async (req, res) => {
    const searchTerm = req.body.searchTerm.toLowerCase();

    try {
      // Busque todos os simulados usando o modelo Simulados
      const simulados = await Simulados.findAll();

      // Filtrando os resultados pelo nome ou data
      const results = simulados.filter(simulado => {
        const formattedDate = formatBrazilianDate(simulado.createdAt);
        return simulado.titulo.toLowerCase().includes(searchTerm) || formattedDate.includes(searchTerm);
      });

      res.render('simulado/pesquisa', { simulados: results, searchTerm, });
    } catch (error) {
      console.error('Erro ao buscar simulados:', error);
      res.status(500).send('Erro ao buscar simulados.');
    }
    //topico e area
  });

//  

module.exports = roteador;