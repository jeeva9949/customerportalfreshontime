// File: server/migrations/YYYYMMDDHHMMSS-modify-support-tickets-status.js

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // The CHANGE COLUMN command is specific to MySQL. 
    // For other databases like PostgreSQL, the command would be different.
    await queryInterface.changeColumn('support_tickets', 'status', {
      type: Sequelize.ENUM('Open', 'Resolved', 'Closed'),
      defaultValue: 'Open'
    });
  },

  async down (queryInterface, Sequelize) {
    // Reverting this change
    await queryInterface.changeColumn('support_tickets', 'status', {
      type: Sequelize.ENUM('Open', 'Closed'),
      defaultValue: 'Open'
    });
  }
};
