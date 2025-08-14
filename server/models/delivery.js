'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    static associate(models) {
      Delivery.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
      Delivery.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
    }
  }
  Delivery.init({
    customer_id: DataTypes.INTEGER,
    agent_id: DataTypes.INTEGER,
    delivery_date: DataTypes.DATE,
    status: DataTypes.STRING,
    item: DataTypes.STRING,
    // Add the new field here
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Delivery',
    tableName: 'deliveries'
  });
  return Delivery;
};
