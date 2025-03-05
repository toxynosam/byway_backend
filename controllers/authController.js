const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');  // Only need one bcrypt library
const bcryptjs = require('bcryptjs')

const signup = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password} = req.body;
    
        // Check for existing user
        const existingUser = await User.findOne({
          $or: [{ username }, {email} ],
        });
    

        // so now we check, if the user exists, we return a response dynamic enough to tell us if it's user name or password
        if (existingUser) {
          if (existingUser.username === username) {
            return res
              .status(400)
              .json({ success: false, message: "Username already exists" });
          }
          if (existingUser.email === email) {
            return res
              .status(400)
              .json({ success: false, message: "Email already exists" });
          }
        }
    
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        // Create new user with hashed password
        const newUser = new User({ 
            firstName, 
            lastName, 
            username, 
            email, 
            password: hashedPassword 
        });
        await newUser.save();

        // Generate token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
    
        res.status(201).json({
          success: true,
          message: "User Created Successfully",
          token,
          user: {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            password:newUser.password
          },
        });
      } catch (error) {
        console.log("Signup Error:", error);
        res.status(500).json({ message: "Error signing up users" });
      }
    };


    const signin = async (req, res) => {
      try {
        // Get the data from the request body (coming from the frontend)
        const { email, password } = req.body;
    
        // find the user by their username
        const user = await User.findOne({ email });
    
        if (!user) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid email Or Password" });
        }
    
        // check if the password is correct
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //   return res
        //     .status(400)
        //     .json({ success: false, message: "Invalid email Or Password" });
        // }
    
        //generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
    
        // return success response with token
        res.json({
          success: true,
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
          },
        });
      } catch (error) {
        console.log("Signin Error:", error);
        res.status(500).json({ message: "Server error during login" });
      }
    };
    
    module.exports = { signup, signin };





















