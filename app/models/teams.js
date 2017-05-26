'use strict';
module.exports = function(sequelize, DataTypes) {
  var Teams = sequelize.define('Teams', {
    name: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Teams.hasMany(models.Users, {foreignKey: 'id'});
      }
    }
  });
  return Teams;
};