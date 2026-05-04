const bcrypt = require("bcryptjs");
const userRepository = require("../users/user.repository");
const tokenService = require("../../services/token.service");
const emailService = require("../../services/email.service");
const ApiError = require("../../utils/ApiError");

const register = async ({
  firstName,
  surname,
  contact,
  gender,
  email,
  password,
  role
}) => {

  const hashedPassword = await bcrypt.hash(password, 12);

  let user;

  // ✅ CUSTOMER
if (role === "customer") {
  const existing = await userRepository.findCustomerByEmailOrPhone(email, contact);

  if (existing.length > 0) {
    const emailExists = existing.some(u => u.email === email);
    const phoneExists = existing.some(u => u.phone === contact);

    if (emailExists && phoneExists) {
      throw new ApiError(409, "Phone number and email already in use for selected account");
    }
    if (emailExists) {
      throw new ApiError(409, "Email already in use for selected account");
    }
    if (phoneExists) {
      throw new ApiError(409, "Phone number already in use for selected account");
    }
  }

  user = await userRepository.createCustomer({
    first_name: firstName,
    last_name: surname || null,
    phone: contact || null,
    gender: ["Male", "Female", "Other", "Prefer not to say"].includes(gender) ? gender : "Other",
    email,
    hashed_password: hashedPassword
  });
}

  else if (role === "supplier") {
  const existing = await userRepository.findSupplierByEmailOrPhone(email, contact);

  if (existing.length > 0) {
    const emailExists = existing.some(u => u.email === email);
    const phoneExists = existing.some(u => u.phone === contact);

    if (emailExists && phoneExists) {
      throw new ApiError(409, "Phone number and email already in use for selected account");
    }
    if (emailExists) {
      throw new ApiError(409, "Email already in use for selected account");
    }
    if (phoneExists) {
      throw new ApiError(409, "Phone number already in use for selected account");
    }
  }

  user = await userRepository.createSupplier({
    supplier_name: `${firstName} ${surname || ""}`.trim(),
    contact_person: firstName,
    phone: contact || null,
    address: null,
    email,
    hashed_password: hashedPassword
  });
}

  else {
    throw new ApiError(400, "Invalid role");
  }

  // Send email
  emailService.sendWelcomeEmail(email, firstName)
    .catch(err => console.error("Email failed:", err.message));

  const token = tokenService.generateToken({
    email,
    role
  });

  return { user, token };
};

const login = async ({ email, password, role }) => {
  const user = await userRepository.findByEmailAndRole(email, role);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = tokenService.generateToken({
    id: user.customer_id || user.supplier_id || user.admin_id,
    email: user.email,
    role
  });

  const { hashed_password, ...safeUser } = user;

  return { user: safeUser, token };
};

module.exports = { register, login };
