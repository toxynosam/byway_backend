const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//Signin up a user
const signup = async function (req, res) {
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      password,
      role,
      bio,
      title,
      experience,
      socialLinks,
      profileImage,
    } = req.body;

    //Check if email or username already exist
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    //If user exists, return a dynamic response
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.username === username
            ? "Username already exists"
            : "Email already exists",
      });
    }

    // Create new user with optional fields
    const newUser = new User({
      firstname,
      lastname,
      username,
      password,
      email,
      //Add optional fields
      ...(role && { role }),
      ...(bio && { bio }),
      ...(title && { title }),
      ...(experience && { experience }),
      ...(socialLinks && { socialLinks }),
      ...(profileImage && { profileImage }),
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        id: newUser._id,
        firstname: newUser.firstname,
        username: newUser.username,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
        bio: newUser.bio,
        title: newUser.title,
        experience: newUser.experience,
        socialLinks: newUser.socialLinks,
      },
    });
  } catch (error) {
    console.log("Signup Error", error);
    res.status(500).json({
      success: false,
      message: "Error Signing Up Users",
      error: error.message,
    });
  }
};

//Sign in User
const signin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //Ensure that the username and email is provided
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide a username or email",
      });
    }

    //Find the user by email OR Username
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or email",
      });
    }

    //Compare entered password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    //Generate JWT token with additional user info
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role, // check this part (problematic) ----> ****** ########
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Success response with token and expanded user info
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        username: user.username,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        title: user.title,
        experience: user.experience,
        enrolledCourses: user.enrolledCourses.length,
        createdCourses: user.createdCourses.length,
        wishlist: user.wishlist.length,
        socialLinks: user.socialLinks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, Please try again later.",
      error: error.message,
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    //user id comes from auth middleware
    const userId = req.userId;

    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses", "title thumbnail progress")
      .populate("createdCourses", "title thumbnail progress")
      .populate("wishlist", "title thumbnail progress");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching current user profile",
      error: error.message,
    });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstname, lastname, bio, title, experience, socialLinks } =
      req.body;

    //Fields to be updated
    const updateData = {};

    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (bio) updateData.bio = bio;
    if (title) updateData.title = title;
    if (experience) updateData.experience = experience;
    if (socialLinks) updateData.socialLinks = socialLinks;

    //handle profile image if provided
    if (req.file) {
      updateData.profileImage = `uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

//update Password
const updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    //validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current Password and New Password Are Required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // Verify Current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Successfully Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating password",
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  signin,
  getCurrentUser,
  updateProfile,
  updatePassword,
};