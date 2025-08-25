'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.belongsTo(models.Customer, { foreignKey: 'customerId' });
    }
  }
  Address.init({
    customerId: DataTypes.INTEGER,
    fullAddress: DataTypes.STRING,
    addressType: DataTypes.ENUM('Home', 'Work', 'Other'),
    isDefault: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Address',
  });
  return Address;
};