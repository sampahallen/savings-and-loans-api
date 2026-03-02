'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creating savings_accounts table...');
    await queryInterface.createTable('savings_accounts', {
      account_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      account_number: {
        type: Sequelize.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      balance: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      account_type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'regular',
        comment: 'regular, fixed_deposit, etc.',
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        comment: 'active, frozen, closed',
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add CHECK constraint for balance >= 0
    await queryInterface.sequelize.query(`
      ALTER TABLE savings_accounts 
      ADD CONSTRAINT chk_savings_balance_non_negative 
      CHECK (balance >= 0);
    `);

    // Add index on user_id
    await queryInterface.addIndex('savings_accounts', ['user_id'], {
      name: 'idx_savings_accounts_user_id',
    });

    // Add index on account_number
    await queryInterface.addIndex('savings_accounts', ['account_number'], {
      name: 'idx_savings_accounts_account_number',
    });

    console.log('Savings_accounts table created successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Dropping savings_accounts table...');
    await queryInterface.dropTable('savings_accounts');
  },
};
