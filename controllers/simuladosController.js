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
     const simulado = await Simulados.findOne({
       where: {
         id: simuladoId
       },
       include: [
         {model: Questões,
         as: 'Questões'}
       ]
     });
 
     // Obtém os IDs das questões já associadas ao simulado
     const questoesAssociadasIds = simulado.Questões.map(questao => questao.id);

     console.log(questoesAssociadasIds)
 
     // Busca todas as questões, exceto as que já estão relacionadas ao simulado
     const questoes = await Questões.findAll({
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
      const { perguntasSelecionadas } = req.body;

      // Primeiro, verifique se o questionário e a pergunta existem
      const simulado = await Simulados.findByPk(simuladoId);
     
      if (!simulado) {
        return res.status(404).send('Simulado não encontrado.');
      }
      if (!perguntasSelecionadas) {
        return res.status(404).send('Questões não selecionadas.');
      }
  
      // Agora, associe as questões ao simulado usando o método addQuestões
      // Este método deve ser definido em sua associação Sequelize entre Simulados e Questões
      await simulado.addQuestões(perguntasSelecionadas);
  

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
        await simulado.removeQuestoes(questoesSelecionadas);

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

roteador.get('/pesquisa-questao', async (req, res) => {

  const pergunta = req.query.pergunta

  // Busca todas as questões relacionadas ao usuárioId e que correspondem à pergunta
  const questoes = await Questões.findAll({
    
  });
  
      const results = questoes.filter(questao => {
        return questao.pergunta.includes(pergunta)
      });


  
  // Verifica se foram encontradas questões
  if (!results) {
    // Se não encontrar, retorna um erro ou uma mensagem
    res.status(404).send('Questões não encontradas');
  } else {
    // Retorna as questões encontradas
    res.status(200).send(results);
    //res.status(200).render('prova/associarperguntasimulado', { questoes });
  }
});



//   roteador.get('/FazerProvatempo/:provaId', async (req, res) => {
//     try {
//       const provaId = req.params.provaId;

//       // Busque as perguntas da prova específica usando o modelo PerguntasProvas
//       const perguntasProvas = await PerguntasProvas.findAll({
//         where: { provaId },
//       });

//       // Crie um array para armazenar os detalhes das perguntas
//       const perguntas = [];

//       // Para cada entrada em perguntasProvas, busque os detalhes da pergunta usando o modelo Questões
//       for (const perguntaProva of perguntasProvas) {
//         const perguntaDetalhe = await Questões.findByPk(perguntaProva.QuestõesId);
//         perguntas.push(perguntaDetalhe);
//       }

//       const prova = await Simulados.findByPk(provaId);

//       res.render('prova/provaTempo', { perguntas, prova, });
//     } catch (error) {
//       console.error('Erro ao buscar perguntas da prova:', error);
//       res.status(500).send('Erro ao buscar perguntas da prova.');
//     }
//   });

//   // Rota para uma prova com alternativas
//   roteador.get('/FazerProvaX/:provaId', async (req, res) => {
//     try {
//       const provaId = req.params.provaId;

//       // Busque as perguntas da prova específica usando o modelo PerguntasProvas
//       const perguntasProvas = await PerguntasProvas.findAll({
//         where: { provaId },
//       });

//       // Crie um array para armazenar os detalhes das perguntas
//       const perguntas = [];

//       // Para cada entrada em perguntasProvas, busque os detalhes da pergunta usando o modelo Perguntas
//       for (const perguntaProva of perguntasProvas) {
//         const perguntaDetalhe = await Questões.findByPk(perguntaProva.QuestõesId);
//         perguntas.push(perguntaDetalhe);
//       }

//       const prova = await Simulados.findByPk(provaId);

//       res.render('prova/provaX', { perguntas, prova, });
//     } catch (error) {
//       console.error('Erro ao buscar perguntas da prova:', error);
//       res.status(500).send('Erro ao buscar perguntas da prova.');
//     }
//   });

//   roteador.get('/FazerProvaXtempo/:provaId', async (req, res) => {
//     try {
//       const provaId = req.params.provaId;

//       // Busque as perguntas da prova específica usando o modelo PerguntasProvas
//       const perguntasProvas = await PerguntasProvas.findAll({
//         where: { provaId },
//       });

//       // Crie um array para armazenar os detalhes das perguntas
//       const perguntas = [];

//       // Para cada entrada em perguntasProvas, busque os detalhes da pergunta usando o modelo Perguntas
//       for (const perguntaProva of perguntasProvas) {
//         const perguntaDetalhe = await Questões.findByPk(perguntaProva.QuestõesId);
//         perguntas.push(perguntaDetalhe);
//       }

//       const prova = await Simulados.findByPk(provaId);

//       res.render('prova/provaXtempo', { perguntas, prova, });
//     } catch (error) {
//       console.error('Erro ao buscar perguntas da prova:', error);
//       res.status(500).send('Erro ao buscar perguntas da prova.');
//     }
//   });

//   //rota funciona nnormalmente
//   roteador.post('/responder-prova/:provaId', async (req, res) => {
//     const { respostas } = req.body;
//     const { idUsuario } = req.session;
//     const { provaId } = req.params;
//     const respostaConcatenada = respostas.join(',');

//     try {
//       await Resposta.create({
//         resposta: respostaConcatenada,
//         usuarioId: idUsuario,
//         provaId,
//       });

//       return res.redirect('/usuario/inicioLogado');
//     } catch (error) {
//       console.error('Erro ao salvar respostas associadas:', error);
//       return res.status(500).send('Erro ao salvar respostas associadas.');
//     }
//   });

//   //rota funciona nnormalmente
//   roteador.post('/responder-provaX/:provaId', async (req, res) => {
//     const { resposta } = req.body;
//     const { idUsuario } = req.session;
//     const { provaId } = req.params;
//     const respostaConcatenada = resposta.join(',');
//     try {
//       await Resposta.create({
//         resposta: respostaConcatenada,
//         usuarioId: idUsuario,
//         provaId,
//       });

//       return res.redirect('/usuario/inicioLogado');
//     } catch (error) {
//       console.error('Erro ao salvar respostas associadas:', error);
//       return res.status(500).send('Erro ao salvar respostas associadas.');
//     }
//   });



  // roteador.get('/seleciona-simulado', async (req, res) => {
  //   const prova = await Simulados.findAll();
  //   const topicos = await Topico.findAll();
  //   const areas = await Area.findAll();

  //   res.render('simulado/seleciona-simulado', { topicos, prova, areas, });
  // }
  // );

//   roteador.get('/seleciona-simulado-objetiva', async (req, res) => {
//     const prova = await Simulados.findAll();
//     const topicos = await Topico.findAll();
//     const areas = await Area.findAll();

//     res.render('simulado/seleciona-simulado2', { topicos, prova, areas, });
//   }
//   );

//   roteador.post('/search', async (req, res) => {
//     const searchTerm = req.body.searchTerm.toLowerCase();

//     try {
//       // Busque todos os simulados usando o modelo Simulados
//       const simulados = await Simulados.findAll();

//       // Filtrando os resultados pelo nome ou data
//       const results = simulados.filter(simulado => {
//         const formattedDate = formatBrazilianDate(simulado.createdAt);
//         return simulado.titulo.toLowerCase().includes(searchTerm) || formattedDate.includes(searchTerm);
//       });

//       res.render('simulado/pesquisa', { simulados: results, searchTerm, });
//     } catch (error) {
//       console.error('Erro ao buscar simulados:', error);
//       res.status(500).send('Erro ao buscar simulados.');
//     }
//     //topico e area
//   });

//   // Função para formatar a data no formato brasileiro (dd/mm/yyyy) e substituir "/" por "-"
//   function formatBrazilianDate(date) {
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   }

//   roteador.get('/seleciona-topico-aleatorio', async (req, res) => {
//     const topicos = await Topico.findAll();
//     const areas = await Area.findAll();

//     res.render('simulado/seleciona-topico-aleatorio', { topicos, areas, });
//   }
//   );

//   roteador.post('/aleatorio/:topicoId/:numeroDeQuestoes', async (req, res) => {
//     const { topicoId, numeroDeQuestoes } = req.params;
//     const questao = await Questões.findAll();
//     const usuarioId1 = req.session.idUsuario;

//     try {
//       const simulado = await Simulados.create({
//         titulo: 'Simulado Aleatório',
//         descricao: 'Simulado gerado automaticamente',
//         usuarioId: usuarioId1,
//         areaId: 1,
//         tipo: 3, // Defina o tipo de simulado conforme necessário
//       });
//       console.log(simulado.id)

//       const questoesDoTopico = await Questões.findAll({
//         where: { topicoId },
//       });

//       // Embaralhe as questões para obter uma ordem aleatória
//       const questoesEmbaralhadas = questoesDoTopico.sort(() => 0.5 - Math.random());

//       // Selecione as primeiras "numeroDeQuestoes" questões
//       const questoesSelecionadas = questoesEmbaralhadas.slice(0, numeroDeQuestoes);

//       for (const questao of questoesSelecionadas) {
//         await PerguntasProvas.create({
//           QuestõesId: questao.id,
//           provaId: simulado.id,
//         });
//       }
//       var provaId = simulado.id;

//       return res.redirect(`/usuario/responder-prova-aleatoria/${provaId}`);
//     } catch (error) {
//       console.error('Erro ao criar simulado aleatório:', error);
//       res.status(500).json({ error: 'Erro ao criar simulado aleatório' });
//     }
//   });

//   roteador.get('/responder-prova-aleatoria/:provaId', async (req, res) => {
//     try {
//       const provaId = req.params.provaId;

//       // Busque as perguntas da prova específica usando o modelo PerguntasProvas
//       const perguntasProvas = await PerguntasProvas.findAll({
//         where: { provaId },
//       });

//       // Crie um array para armazenar os detalhes das perguntas
//       const perguntas = [];

//       // Para cada entrada em perguntasProvas, busque os detalhes da pergunta usando o modelo Perguntas
//       for (const perguntaProva of perguntasProvas) {
//         const perguntaDetalhe = await Questões.findByPk(perguntaProva.QuestõesId);
//         perguntas.push(perguntaDetalhe);
//       }

//       const prova = await Simulados.findByPk(provaId);

//       res.render('prova/questionarioAleatorio', { perguntas, prova, });
//     } catch (error) {
//       console.error('Erro ao buscar perguntas da prova:', error);
//       res.status(500).send('Erro ao buscar perguntas da prova.');
//     }
//   });

//   roteador.post('/responder-prova-aleatoria/:provaId', async (req, res) => {
//     const { resposta } = req.body;
//     const { idUsuario } = req.session;
//     const { provaId } = req.params;
//     const respostaConcatenada = resposta.join(',');
//     try {
//       await Resposta.create({
//         resposta: respostaConcatenada,
//         usuarioId: idUsuario,
//         provaId,
//       });

//       return res.redirect('/usuario/inicioLogado');
//     } catch (error) {
//       console.error('Erro ao salvar respostas associadas:', error);
//       return res.status(500).send('Erro ao salvar respostas associadas.');
//     }
//   });

module.exports = roteador;