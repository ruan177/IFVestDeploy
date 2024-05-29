const { Router } = require('express');
const { Usuario } = require('../models');
const { Favorito } = require('../models');
const { Topico } = require('../models');
const { Opcao } = require('../models');
const { Simulados } = require('../models');
const { Questões } = require('../models');
const { Vestibular } = require('../models');
const { Area } = require('../models');
const { PerguntasProvas } = require('../models');
const { Resposta } = require('../models');
const { Op, NUMBER } = require('sequelize');
const roteador = Router()
const { criarOuAtualizarVestibular } = require('../utils/vestibularUtil')
const upload = require('../midlewares/multerConfig');





roteador.get('/registrar-questao/:tipo', async (req, res) => {
  if (!req.session.login) {
    return res.status(401).redirect('/usuario/login');
  }

  const tipo = req.params.tipo.toLowerCase();
  const usuarioId = req.session.idUsuario;
  //req.session.tipoQuestao = tipo; // Armazena o tipo de questão na sessão

  const Areas = await Area.findAll({
    include: [{
      model: Topico,
      as: 'Topico' // Ajuste conforme necessário, dependendo de como você configurou a associação
    }]
  })
  const Vestibulares = await Vestibular.findAll();

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
  res.status(200).render('professor/criar-questao', { Areas, tipo, simulados, Vestibulares });

});

roteador.post('/registrar-questao/:tipo', upload.array('files'), async (req, res) => {
  try {
    const { pergunta, titulo, resposta, areaId, respostas, correta, topicosSelecionados, novoVestibular, vestibularId } = req.body;

    const anoVestibular = Number(req.body.anoVestibular);
    const tipo = req.params.tipo.toUpperCase();
    const usuarioId = req.session.idUsuario;

    const vestibular = await criarOuAtualizarVestibular(vestibularId, novoVestibular, anoVestibular);

    // Aqui, você pode criar a questão usando newVestibularId
    const questao = await Questões.create({
      pergunta,
      titulo,
      areaId,
      usuarioId,
      resposta,
      tipo,
      vestibularId: vestibular.id, // Usa o novo ID do vestibular
    });


    await questao.addTopicos(topicosSelecionados)

    if (tipo === 'OBJETIVA') {
      // Supondo que 'correta' seja o índice da resposta correta, inicializado antes do loop
      let corretaIndex = parseInt(correta, 10); // Converte 'correta' para um número

      // Adiciona as opções apenas se o tipo do simulado for "objetivo"
      for (let i = 0; i < respostas.length; i++) {
        const opcao = respostas[i];
        // Compara o índice atual com o índice da resposta correta
        let isCorreta = i + 1 === corretaIndex;

        await Opcao.create({
          questao_id: questao.id,
          descricao: opcao, // Supondo que cada opção tenha uma propriedade 'descricao'
          correta: isCorreta // Marca como true se a opção atual é a correta
        });
      }
    }

    res.status(201).redirect('/usuario/inicioLogado');
  } catch (error) {
    console.error(error);
    res.status(500).redirect('/usuario/inicioLogado');
  }
});

roteador.get('/questoes', async (req, res) => {
  const usuarioId = req.session.idUsuario;
  const limit = 10; // Número de questões por página
  const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1
  const offset = (page - 1) * limit;
  try {

    // Dentro do bloco try da rota '/questoes'
    const questoesCount = await Questões.count({
      where: {
        usuarioId: usuarioId,
      },
    });

    const totalPages = Math.ceil(questoesCount / limit);

    const questoes = await Questões.findAll({
      where: {
        usuarioId: usuarioId,
      },
      limit: limit,
      offset: offset,
    });

    res.status(200).render('professor/minhas-questoes', { questoes, totalPages, page });

  } catch (err) {
    req.sesssion.destroy();
    res.status(500).redirect('/usuario/inicioLogado');
  };

});
roteador.get('/topicos', async (req, res) => {
  const usuarioId = req.session.idUsuario;
  const limit = 10; // Número de questões por página
  const {materia} = req.query;
  const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1
  const offset = (page - 1) * limit;
  let topicos;
  try {

    // Dentro do bloco try da rota '/questoes'
    const topicosCount = await Topico.count({
      where: {
        usuarioId: usuarioId,
      },
    });

    const totalPages = Math.ceil(topicosCount / limit);

    const topicosSemFiltro = await Topico.findAll({
      where: {
        usuarioId: usuarioId,
      },
      limit: limit,
      offset: offset,
    });

    if(materia){
      topicos = topicosSemFiltro.filter(topico => topico.materia.toLowerCase().includes(materia.toLowerCase()));
      console.log(topicos)
    } else{
      topicos = topicosSemFiltro
    }


    res.status(200).render('professor/meus-topicos', { topicos, totalPages, page });

  } catch (err) {
    req.sesssion.destroy();
    res.status(500).redirect('/usuario/inicioLogado');
  };

});
roteador.post('/editar-topico', async (req, res) => {
  try {
      const { id, materia } = req.body;
      // Encontre o tópico pelo ID
      const topico = await Topico.findByPk(id);
      if (!topico) {
          return res.status(404).send('Tópico não encontrado.');
      }
      // Atualize o tópico com a nova matéria
      await topico.update({ materia });
      res.redirect('/professor/topicos');
  } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao atualizar o tópico.');
  }
});
roteador.get('/editar-questao/:id', async (req, res) => {
  const { id } = req.params;
  const Topicos = await Topico.findAll()
  try {
    const questao = await Questões.findByPk(id, {
      include: [{
        model: Opcao,
        as: 'Opcoes' // Certifique-se de que este alias corresponda ao definido na associação
      }]
    });
    if (!questao) {
      return res.status(404).send('Questão não encontrada');
    }
    // res.send(JSON.stringify(questao))
    res.render('professor/editar-questao', { questao, Topicos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar questão');
  }

});

// rota incompleta
roteador.patch('/editar-questao', async (req, res) => {
  try {

    const { id, titulo, pergunta, resposta, topicoId, opcoes, correta } = req.body;
    console.log("pergunta:", pergunta)
    // Atualiza a questão no banco de dados

    const questao = await Questões.findByPk(id, {
      include: [{
        model: Opcao,
        as: 'Opcoes' // Certifique-se de que este alias corresponda ao definido na associação
      }]
    })

    if (questao.tipo === 'DISSERTATIVA') {
      await Questões.update({
        titulo: titulo,
        pergunta: pergunta,
        resposta: resposta,
        topicoId: topicoId,

      }, {
        where: { id: id }
      });
    }

    if (questao.tipo === 'OBJETIVA') {

      // tranforma o objeto recebido relacionando a opcao com a descricao alteradas
      const opcoesObj = opcoes.reduce((acc, item) => {
        const [opcaoId, opcaoDescricao] = item.split('-');
        acc[opcaoId] = opcaoDescricao;
        return acc;
      }, {});

      for (let opcaoId in opcoesObj) {
        const opcaoDescricao = opcoesObj[opcaoId];

        const opcaoCorreta = opcaoId === correta ? true : false // compara com o id da opcao que o professor selecionou como correta

        const opcao = Opcao.findByPk(parseInt(opcaoId))

        if (opcao.descricao !== opcaoDescricao) {
          // Se forem diferentes, atualiza a descrição da opção no banco de dados
          await Opcao.update({
            descricao: opcaoDescricao
          }, {
            where: {
              id: opcaoId
            }
          });
        }

        // Verifica se a variável correta está vazia
        if (correta !== '' && opcao.correta !== correta) {
          // Verifica se a opção já tem o campo correto como true

          // Se a opção não tem o campo correto como true, atualiza o campo correta
          await Opcao.update({
            correta: opcaoCorreta
          }, {
            where: {
              id: opcaoId
            }
          });

        }
        await Questões.update({
          titulo: titulo,
          pergunta: pergunta,
          topicoId: topicoId,

        }, {
          where: { id: id }
        });
      }
    }

    res.redirect('/professor/questoes'); // Redireciona para a página de questões após a atualização


  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    res.status(500).send('Erro ao atualizar questão.');
  }
});

//Rota para registrar novo tópico
// professorController.js
roteador.get('/criar-topicos', async (req, res) => {
  const Areas = await Area.findAll({
    include: [{
      model: Topico,
      as: 'Topico' // Ajuste conforme necessário, dependendo de como você configurou a associação
    }]
  })
  res.status(200).render('professor/criar-topicos', { Areas });
});

roteador.post('/registrar-topico', async (req, res) => {
  try {
    const { topicos, areaId } = req.body;
    const usuarioId = req.session.idUsuario;

    //const tipoQuestao = req.session.tipoQuestao

    if (!topicos || !areaId || !usuarioId ) {
      return res.status(400).json({ message: 'Os campos topicos e areaId são obrigatórios.' });
    }

    // Supondo que 'topicos' seja um array de strings representando os nomes dos tópicos
    const novosTopicos = await Promise.all(topicos.map(topico => {
      return Topico.create({
        materia: topico, // Supondo que cada tópico seja uma string
        areaId: areaId,
        usuarioId: usuarioId
      });
    }));

    // Enviar uma resposta de sucesso com os novos tópicos criados
    res.redirect('/usuario/inicioLogado')
    // if (tipoQuestao === 'OBJETIVA') {
    //   res.redirect('/professor/registrar-questao/OBJETIVA');
    // } else if (tipoQuestao === 'DISSERTATIVA') {
    //   res.redirect('/professor/registrar-questao/DISSERTATIVA');
    // } else {
    //   res.redirect('/usuario/inicioLogado');
    // }
  } catch (error) {
    console.error('Error creating topics:', error);
    res.status(500).send('Ocorreu um erro ao criar os tópicos.');
  }
});


module.exports = roteador;