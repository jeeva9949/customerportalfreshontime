// ====================================================
// --- File: server/migrations/...-create-password-requests.js (NEW) ---
// ====================================================
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_requests', {
      id: { 
        allowNull: false, 
        autoIncrement: true, 
        primaryKey: true, 
        type: Sequelize.INTEGER 
      },
      agent_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'agents', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      new_password: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      status: { 
        type: Sequelize.ENUM('Pending', 'Approved'), 
        defaultValue: 'Pending' 
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
    await queryInterface.dropTable('password_requests'); 
  }
};