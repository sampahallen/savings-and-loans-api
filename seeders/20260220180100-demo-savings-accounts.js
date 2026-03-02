'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Seeding demo savings_accounts...');

    const now = new Date();

    // Match customerId from demo-users seeder
    const customerId = '33333333-3333-3333-3333-333333333333';

    await queryInterface.bulkInsert(
      'savings_accounts',
      [
        {
          account_id: '44444444-4444-4444-4444-444444444444',
          user_id: customerId,
          account_number: 'SAV0000000001',
          balance: 1500.0,
          account_type: 'regular',
          status: 'active',
          created_at: now,
          updated_at: now,
        },
        {
          account_id: '55555555-5555-5555-5555-555555555555',
          user_id: customerId,
          account_number: 'SAV0000000002',
          balance: 5000.0,
          account_type: 'fixed_deposit',
          status: 'active',
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );

    console.log('Demo savings_accounts seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing demo savings_accounts...');
    await queryInterface.bulkDelete(
      'savings_accounts',
      {
        account_number: ['SAV0000000001', 'SAV0000000002'],
      },
      {}
    );
  },
};

