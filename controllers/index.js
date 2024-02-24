const comentarios = require('./comentariosController');
const usuarios = require('./usuariosController');
const AreaProfessor = require('./AreaProfessorController');
const inicio = require('./inicioController');


const controllers = {
    comentarios: comentarios,
    usuarios: usuarios,
    AreaProfessor: AreaProfessor,
    inicio: inicio
}

module.exports = controllers;