const {Router} = require('express');
const {Usuario} = require('../models');

const roteador = Router()

roteador.get('/inicio', (req, res)=>{
    res.status(200).render('inicio');
});

roteador.get('/login', (req, res)=>{
    res.status(200).render('login');
});

roteador.get('/cadastro', (req, res)=>{
    res.status(200).render('cadastro');
});

roteador.get('/logoff', (req, res)=>{
    req.session.destroy();
    res.redirect('/usuario/login');
});

roteador.post('/login', async (req, res)=>{
    const {usuario, senha} = req.body;

    const resposta = await Usuario.findOne({
        where: {
            usuario: usuario,
            senha: senha
        }
    });

    req.session.login = false;

    if(resposta){
        req.session.login = true;
        req.session.idUsuario = resposta.id;
        res.redirect('/usuario/inicioLogado');
    }else{
        res.redirect('/usuario/login');
    }
});

roteador.post('/', async (req, res)=>{
    const {nome, usuario, senha, email, email_secundario} = req.body;
    await Usuario.create({nome, usuario, senha, email, email_secundario});
    res.status(201).redirect('/inicio/login');
});

module.exports = roteador;

