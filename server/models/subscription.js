'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.Customer, { foreignKey: 'customerId' });
      Subscription.belongsTo(models.SubscriptionPlan, { foreignKey: 'planId' });
    }
  }
  Subscription.init({
    customerId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    status: DataTypes.ENUM('active', 'paused', 'cancelled', 'expired')
  }, {
    sequelize,
    modelName: 'Subscription',
  });
  return Subscription;
};