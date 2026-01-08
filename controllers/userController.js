import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transactionModel from "../models/transactionModel.js";
// import Razorpay from "razorpay";

/* -------------------------------------------------
   REGISTER
------------------------------------------------- */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Missing fields"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      email,
      password: hash
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      token,
      user: { name: user.name }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};


/* -------------------------------------------------
   LOGIN  (EMAIL-ONLY ACCESS)
------------------------------------------------- */
const loginUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ Password check removed completely
    // Email alone is enough to login

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      token,
      user: { name: user.name }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};


/* -------------------------------------------------
   GET USER CREDITS
------------------------------------------------- */
const userCredits = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("-password");

    res.json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};


/* -------------------------------------------------
   PAYMENT (RAZORPAY)
------------------------------------------------- */
const paymentRazorpay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;

    let amount = 0, credits = 0, plan = "";

    switch (planId) {
      case "Basic":
        amount = 10;
        credits = 100;
        plan = "Basic";
        break;

      case "Advanced":
        amount = 50;
        credits = 500;
        plan = "Advanced";
        break;

      case "Business":
        amount = 250;
        credits = 5000;
        plan = "Business";
        break;

      default:
        return res.json({
          success: false,
          message: "Invalid plan"
        });
    }

    const transaction = await transactionModel.create({
      userId,
      plan,
      amount,
      credits,
      date: Date.now()
    });

    // const order = await razorpayInstance.orders.create({
    //   amount: amount * 100,
    //   currency: "INR",
    //   receipt: transaction._id.toString()
    // });

    res.json({
      success: true,
      message: "Payment initiated",
      transaction
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};


/* -------------------------------------------------
   EXPORTS
------------------------------------------------- */
export {
  registerUser,
  loginUser,
  userCredits,
  paymentRazorpay
};
