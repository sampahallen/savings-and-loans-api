'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creating loans table...');
    await queryInterface.createTable('loans', {
      loan_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      borrower_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      loan_number: {
        type: Sequelize.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      principal_amount: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      interest_rate: {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Annual interest rate as percentage (e.g., 12.5)',
      },
      term_months: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        comment: 'Loan term in months',
      },
      total_amount: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Principal + total interest',
      },
      remaining_balance: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      monthly_payment: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        comment: 'pending, approved, active, completed, defaulted, rejected',
      },
      approved_by: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Loan officer/admin who approved',
      },
      approved_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      disbursed_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      due_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
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

    // Add CHECK constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE loans 
      ADD CONSTRAINT chk_loans_principal_positive 
      CHECK (principal_amount > 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE loans 
      ADD CONSTRAINT chk_loans_interest_rate_valid 
      CHECK (interest_rate >= 0 AND interest_rate <= 100);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE loans 
      ADD CONSTRAINT chk_loans_term_positive 
      CHECK (term_months > 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE loans 
      ADD CONSTRAINT chk_loans_remaining_balance_non_negative 
      CHECK (remaining_balance >= 0);
    `);

    // Add indexes
    await queryInterface.addIndex('loans', ['borrower_id'], {
      name: 'idx_loans_borrower_id',
    });

    await queryInterface.addIndex('loans', ['loan_number'], {
      name: 'idx_loans_loan_number',
    });

    await queryInterface.addIndex('loans', ['status'], {
      name: 'idx_loans_status',
    });

    console.log('Loans table created successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Dropping loans table...');
    await queryInterface.dropTable('loans');
  },
};
