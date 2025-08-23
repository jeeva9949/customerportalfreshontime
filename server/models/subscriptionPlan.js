'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubscriptionPlan extends Model {
    static associate(models) {
      // Define associations here if needed in the future
    }
  }
  SubscriptionPlan.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    duration: {
        type: DataTypes.STRING, // e.g., "/month"
        allowNull: true,
    },
    bestValue: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'SubscriptionPlan',
  });
  return SubscriptionPlan;
};
