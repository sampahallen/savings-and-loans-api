const express = require('express');
const sequelize = require('./config/db')

const app = express();
app.use(express.json());

sequelize.sync()
    .then(()=> console.log('Database and Tables created Successfully'))
    .catch(err => console.error('Error: ',err));

app.listen(4000, ()=> {
    console.log("Your app is running on port 4000")
})