const {Sequelize} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.POST_URL, {
    logging: true,
});

const connectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log("connection has been established successfully");
    } catch (error) {
        console.error("unable to connect to the db", error)
    }
};
connectDB();
module.exports=sequelize;