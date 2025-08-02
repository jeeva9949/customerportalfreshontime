// File: server/migrations/20250802221703-add-notifications-to-agents.js

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('agents', 'notifications_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('agents', 'notifications_enabled');
  }
};
