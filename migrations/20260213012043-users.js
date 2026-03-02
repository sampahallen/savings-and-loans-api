'use strict';

const { UUIDV4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creating users table...');
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      other_names: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DataTypes.DATEONLY,
        allowNull: false,
      },
      ghana_card_no: {
        type: Sequelize.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      ghana_card_img_url: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'customer',
      },
      is_active: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      kyc_status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Reviewing',
      },
      last_login: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
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
    console.log('Users table created successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Dropping users table...');
    await queryInterface.dropTable('users');
  },
};
