'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creating refresh_tokens table...');
    await queryInterface.createTable('refresh_tokens', {
      token_id: {
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
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      is_revoked: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Add index on user_id for faster lookups
    await queryInterface.addIndex('refresh_tokens', ['user_id'], {
      name: 'idx_refresh_tokens_user_id',
    });

    // Add index on token for faster lookups
    await queryInterface.addIndex('refresh_tokens', ['token'], {
      name: 'idx_refresh_tokens_token',
    });

    console.log('Refresh_tokens table created successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Dropping refresh_tokens table...');
    await queryInterface.dropTable('refresh_tokens');
  },
};
