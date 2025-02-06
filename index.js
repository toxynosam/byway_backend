require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const authRoutes = require("./routes/auth");

//Initializing an express app

const app = express();

//Setting up the  middleware

app.use(cors());
app.use(express.json());


//routes - this is where your entry point file i.e index maps the route/endpoint
app.use("/api/auth", authRoutes);

//Connect to Mongoose
mongoose
.connect(process.env.MONGODB_URL)
.then(() => {
    console.log("connected to MONGODB")
})
.catch((error) =>{
    console.log("MongoDB Error:", error);

});

//start the node.js server

const  PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log("server is running on ${PORT}")
});
