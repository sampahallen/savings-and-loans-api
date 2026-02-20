'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creating transactions table...');
    await queryInterface.createTable('transactions', {
      transaction_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      account_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'savings_accounts',
          key: 'account_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Nullable - not all transactions are account-related',
      },
      loan_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'loans',
          key: 'loan_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Nullable - for loan repayments/disbursements',
      },
      transaction_type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        comment: 'deposit, withdrawal, loan_disbursement, loan_repayment, interest_payment, fee',
      },
      amount: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      balance_before: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Account balance before transaction',
      },
      balance_after: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Account balance after transaction',
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      reference_number: {
        type: Sequelize.DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'External reference number',
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'completed',
        comment: 'pending, completed, failed, cancelled',
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

    // Add CHECK constraint for amount > 0
    await queryInterface.sequelize.query(`
      ALTER TABLE transactions 
      ADD CONSTRAINT chk_transactions_amount_positive 
      CHECK (amount > 0);
    `);

    // Add CHECK constraint: either account_id or loan_id must be present
    await queryInterface.sequelize.query(`
      ALTER TABLE transactions 
      ADD CONSTRAINT chk_transactions_account_or_loan 
      CHECK (account_id IS NOT NULL OR loan_id IS NOT NULL);
    `);

    // Add indexes
    await queryInterface.addIndex('transactions', ['account_id'], {
      name: 'idx_transactions_account_id',
    });

    await queryInterface.addIndex('transactions', ['loan_id'], {
      name: 'idx_transactions_loan_id',
    });

    await queryInterface.addIndex('transactions', ['transaction_type'], {
      name: 'idx_transactions_type',
    });

    await queryInterface.addIndex('transactions', ['created_at'], {
      name: 'idx_transactions_created_at',
    });

    console.log('Transactions table created successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Dropping transactions table...');
    await queryInterface.dropTable('transactions');
  },
};
