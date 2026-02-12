const express = require('express');

const app = express();
app.use(express.json());

app.listen(4000, ()=> {
    console.log("Your app is running on port 4000")
})