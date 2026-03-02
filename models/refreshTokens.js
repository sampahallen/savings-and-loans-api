const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const User = require("./users");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    tokenId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "token_id",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: User,
        key: "userId",
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_revoked",
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    underscored: true,
  }
);

// Associations
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(RefreshToken, {
  foreignKey: "userId",
  as: "refreshTokens",
});

module.exports = RefreshToken;
