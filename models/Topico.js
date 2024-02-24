module.exports = (sequelize, DataTypes) => {
  const Topico = sequelize.define('Topico', {
    materia: DataTypes.STRING,
    areaId: DataTypes.INTEGER,
  }, {});

  Topico.associate = (models) => {
    Topico.belongsTo(models.Area);
    Topico.hasMany(models.Favorito);
    Topico.hasMany(models.Questões);
  };

  Topico.associate = (models)=>{
    Topico.hasMany(models.Video);
}

  return Topico;
};