const { Router } = require('express');
const { Usuario } = require('../models');
const { Favorito } = require('../models');
const { Topico } = require('../models');
const { Simulados } = require('../models');
const { Questões } = require('../models');
const { Area } = require('../models');
const { PerguntasProvas } = require('../models');
const { Resposta } = require('../models');
const simulados = require('./simuladosController')
const roteador = Router()

// rota de perfil de usuario removi as outras paginas iguais e adicionei o tipo de perfil ao usuario
roteador.get('/perfil', async (req, res) => {
  const id = req.session.idUsuario;

  const usuario = await Usuario.findByPk(id);
  const favorito = await Favorito.findOne({
    where: { usuarioId: id },
    include: { model: Topico, as: 'Topico' }
  });
  console.log(usuario.perfil);
  if (usuario == null) {
    res.status(200).redirect('/usuario/login');
  } else {
    res.status(200).render('usuario/perfil', { usuario, id, favorito });
  }
});


roteador.get('/inicioLogado', async (req, res) => {
  const id = req.session.idUsuario;

  const usuario = await Usuario.findByPk(id);
  if (usuario == null) {
    res.status(200).redirect('/usuario/login');
  } else {

    res.status(200).render('usuario/inicioLogado');
  }

});



//rota de alterar funciona
roteador.patch('/:id', async (req, res) => {
  let { senha } = req.body;
  try {
    console.log(senha)
    const id = req.session.idUsuario;
    console.log(id)

    if (id != req.params.id) {
      throw new Error("Erro ao atualizar usuario")
    }

    const usuario = await Usuario.findOne({
      where: {
        id: req.params.id
      }
    })
    console.log(usuario)

    if (!usuario) {
      throw new Error("Usuario não existe")
    }

    await Usuario.update({ senha: senha },
      {
        where: { id: usuario.id }
      }
    );
    req.session.destroy();
    res.status(200).redirect("/login");
  } catch (err) {
    req.session.destroy();
    res.status(500).redirect('/inicio');
  }


});


//rota de deletar funciona
roteador.delete('/:id', async (req, res) => {

  const id = req.session.idUsuario;

  try {

    if (id != req.params.id) {
      throw new Error("Erro ao excluir usuario")
    }

    await Usuario.destroy(
      {
        where:
        {
          id: req.params.id
        }
      }
    );
    req.session.destroy();
    res.status(200).redirect('/usuario/login');
  } catch (err) {
    req.session.destroy();
    res.status(500).redirect('/inicio');
  }
});

// pagina para criar simulado
roteador.get('/criar-simulado', async (req, res) => {
  const areas = await Area.findAll();
  res.render('prova/criar-simulado', { areas });
});

// Rota para lidar com o envio do formulário
roteador.post('/criar-prova', async (req, res) => {
  const { titulo, descricao, areaId, tipo } = req.body;
  const usuarioId1 = req.session.idUsuario;
  const tipoformatado = tipo.toUpperCase()
  if(!titulo || !descricao || !areaId || !tipo){
    throw new Error("Dados Invalidos !!! ")
  }

  try {
    // Crie um novo questionário no banco de dados usando Sequelize
    const simulado = await Simulados.create({
      titulo,
      descricao,
      areaId,
      usuarioId: usuarioId1,
      tipo: tipoformatado
    });

    res.redirect(`/usuario/Simulados/${simulado.id}/adicionar-questoes`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocorreu um erro ao criar o questionário.');
  }
});
roteador.get('/video', (req, res) => {
  res.status(200).render('conteudo/video', {});
});

 roteador.use('/simulados', simulados)

module.exports = roteador;

