'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.Customer, { foreignKey: 'customerId' });
      Subscription.belongsTo(models.SubscriptionPlan, { foreignKey: 'planId' });
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
    // --- ADD THIS FIELD ---
    // This field was missing from the model definition, causing save operations to ignore it.
    resumedAt: DataTypes.DATE,
    // --------------------
    nextDeliveryDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Subscription',
  });
  return Subscription;
};

