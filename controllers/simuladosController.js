const { Router } = require('express');
const { Usuario } = require('../models');
const { Favorito } = require('../models');
const { Topico } = require('../models');
const { Simulados } = require('../models');
const { Questões } = require('../models');
const { Area } = require('../models');
const { Opcao } = require('../models');
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
        tipo: tipo,
        '$Questões.id$': {
          [Op.not]: null
        },
        '$Usuario.perfil$': 'PROFESSOR'
      },
      include: [
        {
          model: Questões,
          as: 'Questões'
        },
         {
          model: Usuario, // Inclui o modelo Usuario para acessar o perfil do usuário
          as: 'Usuario', // Ajuste conforme necessário, dependendo de como você configurou a associação
          attributes: ['perfil'], // Seleciona apenas o campo 'perfil' do usuário
          where: {
            perfil: 'PROFESSOR' // Garante que apenas usuários com perfil 'PROFESSOR' sejam incluídos
          }
        }
      ]
    });
    console.log(JSON.stringify(simulados))

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
        {
          model: Questões,
          as: 'Questões'
        }
      ]
    });

    res.render('prova/editarsimulado', { simulado });
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
          as: 'Topicos', // Ajuste conforme necessário, dependendo de como você configurou a associação
          through: { attributes: [] } // Isso exclui os atributos da tabela de junção da resposta
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
          as: 'Topicos', // Ajuste conforme necessário, dependendo de como você configurou a associação
          through: { attributes: [] } // Isso exclui os atributos da tabela de junção da resposta
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

    const simulado = await Simulados.findByPk(simuladoId, {
      include: [{
        model: Questões,
        as: 'Questões', // Certifique-se de que este alias corresponda ao definido na associação
        include: [{
          model: Opcao,
          as: 'Opcoes' // Certifique-se de que este alias corresponda ao definido na associação
        }]
      }]
    });



    res.render('prova/prova', { simulado });

  } catch (error) {
    console.error('Erro ao buscar perguntas da prova:', error);
    res.status(500).send('Erro ao buscar perguntas da prova.');
  }
});


roteador.get('/:simuladoId/gabarito', async (req, res) => {
  const userId = req.session.idUsuario;
  const simuladoId = req.params.simuladoId; 
  try {
    const simulado = await Simulados.findByPk(simuladoId, {
      include: [{
         model: Questões,
         as: 'Questões',
         include: [{
           model: Opcao,
           as: 'Opcoes',
           where: { correta: true } // Inclui apenas as opções corretas
         }, 
         ]}],
     })
 
     const questoesComOpcoesCorretas = simulado.Questões;
  
   // Consulta as respostas do usuário para cada questão
   const respostasDoUsuario = await Resposta.findAll({
      where: {
        usuarioId: userId,
        questaoId: { [Op.in]: questoesComOpcoesCorretas.map(q => q.id) }
      },
      include: [{
        model: Opcao,
        as: 'opcao',
        required: true
      }],
      order: [['createdAt', 'DESC']], 

   });
  
   // Prepara os dados para a view
   const dadosParaView = {
      questoes: questoesComOpcoesCorretas,
      respostasUsuario: respostasDoUsuario,
      simulado: simulado
   };
  
   // Renderiza a view com os dados preparados
   res.render('prova/gabaritoProva', dadosParaView);
 
    //  res.render('prova/gabaritoProva', { simulado });
 
  } catch (error) {
     console.error('Erro ao buscar o gabarito da prova:', error);
     res.status(500).send('Erro ao buscar o gabarito da prova.');
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



roteador.post('/responder-prova/:provaId', async (req, res) => {
  const { questoes, respostas } = req.body;
  const { idUsuario } = req.session;
  const { provaId } = req.params;
  const respostasDissertativas = respostas;

 const simulado =  await Simulados.findByPk(provaId)
  try {
    if (questoes && Object.keys(questoes).length > 0) {

      const questoesObj = questoes.reduce((acc, item) => {
        const [questaoId, opcaoId] = item.split('-');
        acc[questaoId] = opcaoId;
        return acc;
      }, {});

      for (let questaoId in questoesObj) {
        const opcaoId = questoesObj[questaoId];

        await Resposta.create({
          resposta: "", // O ID da opção é salvo no campo resposta
          tipo: 'OBJETIVA',
          opcaoId: opcaoId,
          usuarioId: idUsuario, // Ajuste conforme necessário
          provaId: provaId, // Ajuste conforme necessário
          questaoId: questaoId,
        });
      }
    }

    // Processa as respostas dissertativas, se houver
    if (respostasDissertativas && Object.keys(respostasDissertativas).length > 0) {
      for (let key in respostasDissertativas) {
        const questaoId = key.replace('questao_', '');
        const resposta = respostasDissertativas[key];

        await Resposta.create({
          resposta: resposta,
          tipo: 'DISSERTATIVA',
          usuarioId: idUsuario, // Ajuste conforme necessário
          provaId: provaId, // Ajuste conforme necessário
          questaoId: questaoId,
        });
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));

    if(simulado.tipo === "OBJETIVO"){
      res.status(200).redirect(`/usuario/simulados/${simulado.id}/gabarito`)
    }else{
      res.redirect(`/usuario/simulados/`);
    }


    // substituir por um redirect para a pagina do gabarito
  } catch (error) {
    console.error('Erro ao salvar respostas associadas:', error);
    return res.status(500).send('Erro ao salvar respostas associadas.');
  }
});

module.exports = roteador;