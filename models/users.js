const { password } = require('pg/lib/defaults');
const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');

const phoneValidateRegex = /^0\d{9}$/
const User = sequelize.define(
    'User',
    {
        userId: {type: DataTypes.UUID, autoIncrement: true, primaryKey: true},
        firstName: {type: DataTypes.STRING, allowNull:false},
        lastName: {type: DataTypes.STRING, allowNull: false},
        otherNames: {type: DataTypes.STRING, allowNull: true},
        email: {
            types: DataTypes.STRING,
            unique: true, allowNull:false, 
            validate: {isEmail: true}
        },
        phoneNumber: {
            type: DataTypes.STRING, 
            unique: true, 
            allowNull: false,
            validate: function(v) {
                return phoneValidateRegex.test(v)
            }
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull:false,
        },
        ghanaCardNo: {
            type: DataTypes.STRING(20),
            allowNull:false,
            unique: true,
            validate: {
                notEmpty: true,
            }
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'customer',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue: true,
        },
        kycStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Reviewing',
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async(user) => {
                user.password = await bcrypt.hash(user.password, 13)
            },
            beforeUpdate: async(user) => {
                if(user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 13);
                }
            },
        },
    },
);
User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password,this.password);
};
module.exports = User;