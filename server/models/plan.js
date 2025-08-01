/*
 * server/models/plan.js
 * Defines the Plan model.
 */
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    static associate(models) {
      // A Plan can be assigned to many Customers
      Plan.hasMany(models.Customer, {
        foreignKey: 'plan_id',
        as: 'customers',
      });
    }
  }
  Plan.init({
    type: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    frequency: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Plan',
    tableName: 'plans',
  });
  return Plan;
};