module.exports = (sequelize, DataTypes) => {
    const Video = sequelize.define('Video', {
      materia: DataTypes.STRING,
    }, {});
  
    Video.associate = (models) => {
        Video.belongsTo(models.Topico);
    };
  
    return Video;
  };