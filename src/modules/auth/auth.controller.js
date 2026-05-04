const authService = require("./auth.service");
const ApiResponse = require("../../utils/ApiResponse");

const userRepository = require("../users/user.repository");
const ApiError = require("../../utils/ApiError");

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return res
      .status(201)
      .json(
        ApiResponse.success("User registered successfully", { user, token }),
      );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return res
      .status(200)
      .json(ApiResponse.success("Login successful", { user, token }));
  } catch (error) {
    next(error);
  }
};


const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const roles = await userRepository.findRolesByEmail(email);

    if (roles.length === 0) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({ roles });
  } catch (err) {
    next(err);
  }
};


const logout = async (req, res, next) => {
  try {
    return res.status(200).json(ApiResponse.success("Logged out successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, checkEmail, logout };
