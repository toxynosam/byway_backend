const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');  // Choose one bcrypt library

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
    
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user with hashed password
        const newUser = new User({ 
            firstName, 
            lastName, 
            username, 
            email, 
            password: hashedPassword // Save the hashed password
        });
        await newUser.save();
    
        res.status(201).json({
          success: true,
          message: "User Created Successfully",
          user: {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            // Don't return the password
          },
        });
      } catch (error) {
        console.log("Signup Error:", error.message); // Log more details
        res.status(500).json({ message: "Error signing up users" });
      }
};

const signin = async (req, res) => {
  try {
    // Get the data from the request body (coming from the frontend)
    const { email, username, password } = req.body;

    if(!username && !email){
      return res.status(400).json({
        success:false,
        message: "Please provide a username or email"
      })
    }

    const user = await User.findOne({
      $or:[{username}, {email}]
    })

    if(!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or email"
      })
    }

    const isMatch = await user.comparePassword(password)

    if(!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password incorrect"
      })
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email:user.email
      },
      process.env.JWT_SECRET, 
      {
        expiresIn:"3d"
      }
    )

    res.status(200).json({
      success:true,
      message: "Login Successful",
      token,
      user:{
        id:user._id,
        username:user.username,
        email:user.email
      }
    })
  } catch (error) {
    console.log("Signin Error:", error.message);
    res.status(500).json({success:false, message: "Server error during login" });
  }
};
    
module.exports = { signup, signin };