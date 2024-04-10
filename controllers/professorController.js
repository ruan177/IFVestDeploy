const { Router } = require('express');
const { Usuario } = require('../models');
const { Favorito } = require('../models');
const { Topico } = require('../models');
const { Opcao } = require('../models');
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
  res.status(200).render('professor/criar-questao', { Topicos, tipo, simulados });
});

roteador.get('/questoes', async (req, res) => {
  const usuarioId = req.session.idUsuario;
  try {

    const questoes = await Questões.findAll({
      where: {
        usuarioId: usuarioId
      },
      include: Topico
    });

    res.status(200).render('professor/minhas-questoes', { questoes })

  } catch (err) {
    req.sesssion.destroy();
    res.status(500).redirect('/usuario/inicioLogado');
  };

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


roteador.post('/registrar-questao/:tipo', async (req, res) => {
  try {
    const { pergunta, topicoId, titulo, resposta, respostas, simuladoId, } = req.body;
    let tipo = req.params.tipo.toUpperCase(); // Converte o tipo para maiúsculas
    const usuarioId = req.session.idUsuario;

    if (tipo !== "OBJETIVA" && tipo !== "DISSERTATIVA") {
      throw new Error("Tipo de questão inválido");
    }

    // Função para criar a questão e associar ao simulado
    const criareAssociarQuestao = async (resposta) => {
      const questao = await Questões.create({
        pergunta,
        titulo,
        topicoId,
        usuarioId,
        resposta,
        tipo // Certifique-se de que 'tipo' seja incluído aqui
      });
      if (tipo === 'OBJETIVA') {
        // Adiciona as opções apenas se o tipo do simulado for "objetivo"
        for (const opcoes of respostas) {
          // Verifica se 'descricao' e 'correta' estão presentes e se 'correta' é um booleano
          let correta = opcoes.correta ? true : false

          await Opcao.create({
            questao_id: questao.id,
            descricao: opcoes.texto, // Supondo que cada opção tenha uma propriedade 'descricao'
            correta: correta // Supondo que cada opção tenha uma propriedade 'correta'
          });
        }
      }

      if (simuladoId) {
        const simulado = await Simulados.findByPk(simuladoId);
        // Verifica se o tipo do simulado é "objetivo"

        await simulado.addQuestões(questao);
      }
    };

    if (tipo === "OBJETIVA") {
      await criareAssociarQuestao(" ");

    } else if (tipo === "DISSERTATIVA") {
      await criareAssociarQuestao(resposta);
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