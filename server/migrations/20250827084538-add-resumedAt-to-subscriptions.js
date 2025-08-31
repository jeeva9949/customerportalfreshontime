'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adds the new 'resumedAt' column to your existing 'Subscriptions' table.
    await queryInterface.addColumn('Subscriptions', 'resumedAt', {
      type: Sequelize.DATE,
      allowNull: true, // It can be null if the subscription has never been resumed.
    });
  },
  async down(queryInterface, Sequelize) {
    // This allows you to undo the migration if needed.
    await queryInterface.removeColumn('Subscriptions', 'resumedAt');
  }
};
