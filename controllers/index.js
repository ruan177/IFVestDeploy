const comentarios = require('./comentariosController');
const usuarios = require('./usuariosController');
const AreaProfessor = require('./AreaProfessorController');
const inicio = require('./inicioController');
const professor = require('./professorController')
const simulados = require('./simuladosController')

const controllers = {
    comentarios: comentarios,
    usuarios: usuarios,
    AreaProfessor: AreaProfessor,
    inicio: inicio,
    professor: professor,
    simulados: simulados
}

module.exports = controllers;