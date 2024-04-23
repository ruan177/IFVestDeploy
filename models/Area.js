module.exports = (sequelize, DataTypes) => {
    const Area = sequelize.define('Area', {
      area: DataTypes.STRING,
      descricao: DataTypes.STRING,
    }, {
      tableName: 'areas'
    });
    
    Area.associate = (models)=>{
      Area.hasMany(models.Topico, {
        foreignKey: 'areaId',
        as: 'Topico'
    });
  }
    return Area;
  };