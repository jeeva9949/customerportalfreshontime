/*
 * server/models/customer.js
 * Defines the Customer model.
 */
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      // A Customer belongs to one Plan
      Customer.belongsTo(models.Plan, {
        foreignKey: 'plan_id',
        as: 'plan',
      });
      // A Customer has many Deliveries
      Customer.hasMany(models.Delivery, {
        foreignKey: 'customer_id',
        as: 'deliveries',
      });
      // A Customer has many Payments
      Customer.hasMany(models.Payment, {
        foreignKey: 'customer_id',
        as: 'payments',
      });
    }
  }
  Customer.init({
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    mobile: { type: DataTypes.STRING, allowNull: false },
    plan_id: { type: DataTypes.INTEGER }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
  });
  return Customer;
};