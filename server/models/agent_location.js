'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class agent_location extends Model {
    static associate(models) {
      agent_location.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
    }
  }
  agent_location.init({
    agent_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    status: DataTypes.STRING,
    last_update: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'agent_location',
    timestamps: false // We are managing the timestamp manually with 'last_update'
  });
  return agent_location;
};
