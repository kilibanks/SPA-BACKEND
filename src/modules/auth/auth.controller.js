const authService = require("./auth.service");
const ApiResponse = require("../../utils/ApiResponse");

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

const logout = async (req, res, next) => {
  try {
    return res.status(200).json(ApiResponse.success("Logged out successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout };
