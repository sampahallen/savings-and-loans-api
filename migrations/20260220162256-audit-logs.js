'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creating audit_logs table...');
    await queryInterface.createTable('audit_logs', {
      audit_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      performed_by: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who performed the action (nullable for system actions)',
      },
      action: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        comment: 'create, update, delete, approve, reject, etc.',
      },
      entity_type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        comment: 'User, SavingsAccount, Loan, Transaction, etc.',
      },
      entity_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        comment: 'ID of the affected entity',
      },
      old_values: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        comment: 'Previous values (for updates)',
      },
      new_values: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        comment: 'New values',
      },
      ip_address: {
        type: Sequelize.DataTypes.STRING(45),
        allowNull: true,
        comment: 'IPv4 or IPv6 address',
      },
      user_agent: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for common queries
    await queryInterface.addIndex('audit_logs', ['performed_by'], {
      name: 'idx_audit_logs_performed_by',
    });

    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], {
      name: 'idx_audit_logs_entity',
    });

    await queryInterface.addIndex('audit_logs', ['action'], {
      name: 'idx_audit_logs_action',
    });

    await queryInterface.addIndex('audit_logs', ['created_at'], {
      name: 'idx_audit_logs_created_at',
    });

    console.log('Audit_logs table created successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Dropping audit_logs table...');
    await queryInterface.dropTable('audit_logs');
  },
};
