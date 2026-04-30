const bcrypt = require("bcryptjs");
const userRepository = require("../users/user.repository");
const tokenService = require("../../services/token.service");
const emailService = require("../../services/email.service");
const ApiError = require("../../utils/ApiError");

const register = async ({ name, email, password }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
  });

  // Send welcome email
  await emailService.sendWelcomeEmail(user.email, user.name);

  const token = tokenService.generateToken({ id: user.id, email: user.email });
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = tokenService.generateToken({ id: user.id, email: user.email });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

module.exports = { register, login };
