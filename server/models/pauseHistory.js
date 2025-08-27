'use strict';
const { Model } = require('sequelize');

// This is the standard Sequelize model definition format.
// It exports a function that takes 'sequelize' and 'DataTypes' as arguments.
module.exports = (sequelize, DataTypes) => {
  class PauseHistory extends Model {
    static associate(models) {
      PauseHistory.belongsTo(models.Subscription, { foreignKey: 'subscriptionId' });
    }
  }
  PauseHistory.init({
    subscriptionId: DataTypes.INTEGER,
    pauseDate: DataTypes.DATE,
    resumeDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PauseHistory',
  });
  return PauseHistory;

};