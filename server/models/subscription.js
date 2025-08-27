'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.Customer, { foreignKey: 'customerId' });
      Subscription.belongsTo(models.SubscriptionPlan, { foreignKey: 'planId' });
      // A subscription can be paused multiple times
      Subscription.hasMany(models.PauseHistory, { foreignKey: 'subscriptionId' });
    }
  }
  Subscription.init({
    customerId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    status: DataTypes.ENUM('active', 'paused', 'cancelled', 'expired'),
    pausedAt: DataTypes.DATE,
    nextDeliveryDate: DataTypes.DATE // New field
  }, {
    sequelize,
    modelName: 'Subscription',
  });
  return Subscription;
};
