'use strict';

const { UUIDV4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
              userId: {type: Sequelize.DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true},
              firstName: {type: Sequelize.DataTypes.STRING, allowNull:false},
              lastName: {type: Sequelize.DataTypes.STRING, allowNull: false},
              otherNames: {type: Sequelize.DataTypes.STRING, allowNull: true},
              email: {
                  type: Sequelize.DataTypes.STRING,
                  unique: true, allowNull:false,
              },
              phoneNumber: {
                  type: Sequelize.DataTypes.STRING, 
                  unique: true, 
                  allowNull: false,
              },
              password: {
                  type: Sequelize.DataTypes.TEXT,
                  allowNull: false,
              },
              dateOfBirth: {
                  type: Sequelize.DataTypes.DATEONLY,
                  allowNull:false,
              },
              ghanaCardNo: {
                  type: Sequelize.DataTypes.STRING(20),
                  allowNull:false,
                  unique: true,
                  validate: {
                      notEmpty: true,
                  }
              },
              ghanaCardImgUrl: {
                type: Sequelize.DataTypes.STRING,
                allowNull:true,
              },
              role: {
                  type: Sequelize.DataTypes.STRING,
                  allowNull: false,
                  defaultValue: 'customer',
              },
              isActive: {
                  type: Sequelize.DataTypes.BOOLEAN,
                  allowNull:false,
                  defaultValue: true,
              },
              kycStatus: {
                  type: Sequelize.DataTypes.STRING,
                  allowNull: false,
                  defaultValue: 'Reviewing',
              },
              lastLogin: {
                  type: Sequelize.DataTypes.DATE,
                  allowNull: true,
                  defaultValue: null,
              },
              createdAt: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
              },
              updatedAt: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
              },
    });
  },

  async down (queryInterface, Sequelize) {
return queryInterface.dropTable('users')
  }
};
