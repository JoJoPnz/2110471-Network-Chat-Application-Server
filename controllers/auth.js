const User = require("../models/User");

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //Create user
    const user = await User.create({
      email,
      password,
    });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    // validation error handler
    if (err.name && err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    // duplicate email error handler
    if (err.code && err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "This email has already taken" });
    }
    console.log(err.stack);
    return res.status(400).json({ success: false });
  }
};

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password" });
    }

    //Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "Cannot convert email or password to string",
    });
  }
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    // add for front end
    _id: user._id,
    name: user.name,
    email: user.email,
    // end for front end
    token,
  });
};

//@desc     Log user out / clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};
