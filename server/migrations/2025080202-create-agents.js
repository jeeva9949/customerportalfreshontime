/*
 * server/migrations/2025080202-create-agents.js (NEW FILE)
 */
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agents', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      mobile: { type: Sequelize.STRING },
      join_date: { type: Sequelize.DATE },
      bank_details: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('agents'); }
};