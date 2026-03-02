const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const phoneValidateRegex = /^0\d{9}$/;

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "user_id",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "last_name",
    },
    otherNames: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "other_names",
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      field: "phone_number",
      validate: function (v) {
        return phoneValidateRegex.test(v);
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "date_of_birth",
    },
    ghanaCardNo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: "ghana_card_no",
      validate: {
        notEmpty: true,
      },
    },
    ghanaCardImgUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "ghana_card_img_url",
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "customer",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    kycStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Reviewing",
      field: "kyc_status",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "last_login",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 13);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 13);
        }
      },
    },
  }
);

User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
