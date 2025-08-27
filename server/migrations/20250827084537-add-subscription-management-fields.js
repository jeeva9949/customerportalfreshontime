'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add nextDeliveryDate to the Subscriptions table
    await queryInterface.addColumn('Subscriptions', 'nextDeliveryDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Create a new table to store the history of pauses
    await queryInterface.createTable('PauseHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subscriptionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pauseDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      resumeDate: {
        type: Sequelize.DATE,
        allowNull: true // This is set when the admin resumes the subscription
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Subscriptions', 'nextDeliveryDate');
    await queryInterface.dropTable('PauseHistories');
  }
};
