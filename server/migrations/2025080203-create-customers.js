/*
 * server/migrations/2025080203-create-customers.js (NEW FILE)
 */
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.TEXT },
      mobile: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      first_purchase_date: { type: Sequelize.DATE },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('customers'); }
};