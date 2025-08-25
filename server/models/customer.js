'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    validPassword(password) {
      return this.password ? bcrypt.compareSync(password, this.password) : false;
    }
    
    static associate(models) {
      Customer.hasMany(models.Delivery, { foreignKey: 'customer_id' });
      Customer.hasMany(models.Payment, { foreignKey: 'customer_id' });
      // Add this new association
      Customer.hasMany(models.Address, { foreignKey: 'customerId' });
    }
  }
  Customer.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    hooks: {
      beforeCreate: (customer) => {
        if (customer.password) {
          customer.password = bcrypt.hashSync(customer.password, 10);
        }
      },
      beforeUpdate: (customer) => {
        if (customer.changed('password') && customer.password) {
          customer.password = bcrypt.hashSync(customer.password, 10);
        }
      }
    }
  });
  return Customer;
};