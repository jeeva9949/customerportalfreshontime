'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adds the new 'pausedAt' column to your existing 'Subscriptions' table.
    await queryInterface.addColumn('Subscriptions', 'pausedAt', {
      type: Sequelize.DATE,
      allowNull: true, // It can be null if the subscription is not paused.
    });
  },
  async down(queryInterface, Sequelize) {
    // This allows you to undo the migration if needed.
    await queryInterface.removeColumn('Subscriptions', 'pausedAt');
  }
};
