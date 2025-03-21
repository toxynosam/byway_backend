const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// we are designing the way the user information will be stored on the backend

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        unique: true,
    },
    lastName: {
        type: String,
        reuired: true,
        unique: true,
    },
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "email must be valid with proper email format"],
    },
    password: {
        type: String,
        required: true,
    }

});

//Encrypt the password before
userSchema.pre("save", async function (next){
    //only encrpt if password is been modified.
    if(!this.isModified("password")) return next();

   try {
     this.password = await bcrypt.hash(this.password, 10);
     next();
   } catch (error) {
    next(error)
   }

});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}



const User = mongoose.model("User", userSchema)

module.exports = User;
