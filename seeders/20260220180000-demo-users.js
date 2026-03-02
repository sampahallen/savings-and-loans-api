'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Seeding demo users...');

    // Predefined UUIDs so they can be referenced in other seeders
    const adminId = '11111111-1111-1111-1111-111111111111';
    const loanOfficerId = '22222222-2222-2222-2222-222222222222';
    const customerId = '33333333-3333-3333-3333-333333333333';

    const now = new Date();

    const passwordAdmin = await bcrypt.hash('Admin123!', 13);
    const passwordOfficer = await bcrypt.hash('Officer123!', 13);
    const passwordCustomer = await bcrypt.hash('Customer123!', 13);

    await queryInterface.bulkInsert(
      'users',
      [
        {
          user_id: adminId,
          first_name: 'System',
          last_name: 'Admin',
          other_names: null,
          email: 'admin@savingsloans.com',
          phone_number: '0200000001',
          password: passwordAdmin,
          date_of_birth: '1990-01-01',
          ghana_card_no: 'GHA-ADMIN-0001',
          ghana_card_img_url: null,
          role: 'admin',
          is_active: true,
          kyc_status: 'Approved',
          last_login: null,
          created_at: now,
          updated_at: now,
        },
        {
          user_id: loanOfficerId,
          first_name: 'Loan',
          last_name: 'Officer',
          other_names: null,
          email: 'loan.officer@savingsloans.com',
          phone_number: '0200000002',
          password: passwordOfficer,
          date_of_birth: '1991-02-02',
          ghana_card_no: 'GHA-OFFICER-0001',
          ghana_card_img_url: null,
          role: 'loan_officer',
          is_active: true,
          kyc_status: 'Approved',
          last_login: null,
          created_at: now,
          updated_at: now,
        },
        {
          user_id: customerId,
          first_name: 'Kojo',
          last_name: 'Mensah',
          other_names: 'Kwame',
          email: 'customer@savingsloans.com',
          phone_number: '0200000003',
          password: passwordCustomer,
          date_of_birth: '1992-03-03',
          ghana_card_no: 'GHA-CUSTOMER-0001',
          ghana_card_img_url: null,
          role: 'customer',
          is_active: true,
          kyc_status: 'Approved',
          last_login: null,
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );

    console.log('Demo users seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing demo users...');
    await queryInterface.bulkDelete(
      'users',
      {
        email: [
          'admin@savingsloans.com',
          'loan.officer@savingsloans.com',
          'customer@savingsloans.com',
        ],
      },
      {}
    );
  },
};

