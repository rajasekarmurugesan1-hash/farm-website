const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

/* MONGODB CONNECTION */
mongoose.connect("mongodb://127.0.0.1:27017/mmmfarm", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB Connected");
})
.catch(err => {
  console.log(err);
});

/* USER SCHEMA */
const userSchema = new mongoose.Schema({

  name: String,

  email: {
    type: String,
    unique: true
  },

  phone: String,

  password: String

});

const User = mongoose.model("User", userSchema);

/* REGISTER API */
app.post("/register", async (req, res) => {

  try {

    const { name, email, phone, password } = req.body;

    /* CHECK USER */
    const existingUser = await User.findOne({ email });

    if(existingUser){
      return res.json({
        success:false,
        message:"User already exists"
      });
    }

    /* HASH PASSWORD */
    const hashedPassword =
      await bcrypt.hash(password, 10);

    /* SAVE USER */
    const newUser = new User({

      name,
      email,
      phone,
      password: hashedPassword

    });

    await newUser.save();

    res.json({
      success:true,
      message:"Account created successfully"
    });

  } catch(err){

    console.log(err);

    res.json({
      success:false,
      message:"Server error"
    });

  }

});

/* LOGIN API */
app.post("/login", async (req, res) => {

  try{

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){

      return res.json({
        success:false,
        message:"Invalid email"
      });

    }

    const isMatch =
      await bcrypt.compare(password, user.password);

    if(!isMatch){

      return res.json({
        success:false,
        message:"Invalid password"
      });

    }

    res.json({
      success:true,
      user:{
        name:user.name,
        email:user.email,
        phone:user.phone
      }
    });

  }catch(err){

    console.log(err);

    res.json({
      success:false,
      message:"Server error"
    });

  }

});

/* SERVER */
app.listen(5000, () => {

  console.log("Server running on port 5000");

});