require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middlewares/errorHandler");
const rateLimit = require("express-rate-limit");

//Initializing an express app
const app = express();

// Configure middlewares with open CORS
app.use(
    cors({
      origin: "*", // This allows all origins
      credentials: true,
    })
  );

app.use(express.json());

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests, please try again later.",
  });
  
//routes - this is where your entry point file i.e index maps the route/endpoint
app.use("/api/auth", rateLimiter);
app.use("/api/auth", authRoutes);
app.use(errorHandler);


// MongoDB connection URL
const url = process.env.MONGODB_URL;

const options = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 5000,
};


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
