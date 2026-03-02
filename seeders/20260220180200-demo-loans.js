'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Seeding demo loans...');

    const now = new Date();

    const adminId = '11111111-1111-1111-1111-111111111111';
    const customerId = '33333333-3333-3333-3333-333333333333';

    const principalAmount = 2000.0;
    const interestRate = 12.0; // annual %
    const termMonths = 12;

    // Simple amortization calculation (same logic as controller)
    const principal = principalAmount;
    const rateMonthly = interestRate / 100 / 12;
    const term = termMonths;

    const monthlyPayment =
      (principal * rateMonthly * Math.pow(1 + rateMonthly, term)) /
      (Math.pow(1 + rateMonthly, term) - 1);

    const totalAmount = monthlyPayment * term;

    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + termMonths);

    await queryInterface.bulkInsert(
      'loans',
      [
        {
          loan_id: '66666666-6666-6666-6666-666666666666',
          borrower_id: customerId,
          loan_number: 'LOAN0000000001',
          principal_amount: principalAmount,
          interest_rate: interestRate,
          term_months: termMonths,
          total_amount: parseFloat(totalAmount.toFixed(2)),
          remaining_balance: parseFloat(totalAmount.toFixed(2)),
          monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
          status: 'approved',
          approved_by: adminId,
          approved_at: now,
          disbursed_at: null,
          due_date: dueDate,
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );

    console.log('Demo loans seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing demo loans...');
    await queryInterface.bulkDelete(
      'loans',
      {
        loan_number: ['LOAN0000000001'],
      },
      {}
    );
  },
};

