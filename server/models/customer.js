/*
 * server/models/customer.js (UPDATED)
 * This model no longer has any association with Plans.
 */
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Delivery, { foreignKey: 'customer_id' });
      Customer.hasMany(models.Payment, { foreignKey: 'customer_id' });
    }
  }
  Customer.init({
    name: DataTypes.STRING, address: DataTypes.TEXT, mobile: DataTypes.STRING,
    email: DataTypes.STRING, first_purchase_date: DataTypes.DATE
  }, { sequelize, modelName: 'Customer', tableName: 'customers' });
  return Customer;
};