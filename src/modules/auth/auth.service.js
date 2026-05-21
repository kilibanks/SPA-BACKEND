const bcrypt = require("bcryptjs");
const userRepository = require("../users/user.repository");
const tokenService = require("../../services/token.service");
const emailService = require("../../services/email.service");
const ApiError = require("../../utils/ApiError");

const { sendLoginCodeEmail } = require("../../services/email.service");

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

  const emailCode =
    Math.floor(100000 + Math.random() * 900000).toString();

  const phoneCode =
    Math.floor(100000 + Math.random() * 900000).toString();

  // CHECK EXISTING REAL USERS

  if (role === "customer") {

    const existing =
      await userRepository.findCustomerByEmailOrPhone(
        email,
        contact
      );

    if (existing.length > 0) {

      const emailExists =
        existing.some(u => u.email === email);

      const phoneExists =
        existing.some(u => u.phone === contact);

      if (emailExists && phoneExists) {
        throw new ApiError(
          409,
          "Phone number and email already in use"
        );
      }

      if (emailExists) {
        throw new ApiError(
          409,
          "Email already in use"
        );
      }

      if (phoneExists) {
        throw new ApiError(
          409,
          "Phone number already in use"
        );
      }
    }
  }

  else if (role === "supplier") {

    const existing =
      await userRepository.findSupplierByEmailOrPhone(
        email,
        contact
      );

    if (existing.length > 0) {

      const emailExists =
        existing.some(u => u.email === email);

      const phoneExists =
        existing.some(u => u.phone === contact);

      if (emailExists && phoneExists) {
        throw new ApiError(
          409,
          "Phone number and email already in use"
        );
      }

      if (emailExists) {
        throw new ApiError(
          409,
          "Email already in use"
        );
      }

      if (phoneExists) {
        throw new ApiError(
          409,
          "Phone number already in use"
        );
      }
    }
  }

  // CHECK TEMP USERS

  const existingTemp =
    await userRepository.findTempUserByEmailAndType(email, role);

  if (existingTemp) {
  await userRepository.deleteTempUser(
    existingTemp.temp_user_id
  );
}

  // CREATE TEMP USER

  await userRepository.createTempUser({

    gender:
  role === "customer"
    ? gender
    : null,

    user_type: role,

    first_name: firstName,

    last_name:
      surname || null,

    supplier_name:
      role === "supplier"
        ? `${firstName} ${surname || ""}`.trim()
        : null,

    contact_person:
      role === "supplier"
        ? firstName
        : null,

    phone:
  contact?.trim()
    ? contact.trim()
    : null,

    email,

    hashed_password:
      hashedPassword,

    email_verification_code:
      emailCode,

    phone_verification_code:
      phoneCode,

    email_code_expires_at:
      new Date(Date.now() + 10 * 60 * 1000),

    phone_code_expires_at:
      new Date(Date.now() + 10 * 60 * 1000)
  });

  // SEND EMAIL OTP

  await emailService.sendVerificationEmail(
    email,
    emailCode
  );

  return {
    requiresVerification: true,
    email
  };
};


const verifyEmail = async ({
  email,
  code
}) => {

  const tempUser =
    await userRepository.findTempUserByEmail(email);

  if (!tempUser) {
    throw new ApiError(
      404,
      "Verification session expired"
    );
  }

  if (
  new Date(tempUser.email_code_expires_at) < new Date()
) {

  await userRepository.deleteTempUser(
    tempUser.temp_user_id
  );

  throw new ApiError(
    400,
    "Verification code expired"
  );
}

  if (
    tempUser.email_verification_code !== code
  ) {
    throw new ApiError(
      400,
      "Invalid verification code"
    );
  }

  
  
  if (tempUser.user_type === "customer") {


  const existing =
    await userRepository.findCustomerByEmailOrPhone(
      tempUser.email,
      tempUser.phone
    );

  if (existing.length > 0) {

    await userRepository.deleteTempUser(
      tempUser.temp_user_id
    );

    throw new ApiError(
      409,
      "Account already exists"
    );
  }

} else {

  const existing =
    await userRepository.findSupplierByEmailOrPhone(
      tempUser.email,
      tempUser.phone
    );

  if (existing.length > 0) {

    await userRepository.deleteTempUser(
      tempUser.temp_user_id
    );

    throw new ApiError(
      409,
      "Account already exists"
    );
  }
}

  let user;

  if (tempUser.user_type === "customer") {

    user =
      await userRepository.createCustomer({

        first_name:
          tempUser.first_name,

        last_name:
          tempUser.last_name,

        phone:
  tempUser.phone?.trim()
    ? tempUser.phone.trim()
    : null,

        gender:
  ["Male", "Female", "Other", "Prefer not to say"]
    .includes(tempUser.gender)
      ? tempUser.gender
      : "Other",

        email:
          tempUser.email,

        hashed_password:
          tempUser.hashed_password
      });

  } else {

    user =
      await userRepository.createSupplier({

        supplier_name:
          tempUser.supplier_name,

        contact_person:
          tempUser.contact_person,

        phone:
  tempUser.phone?.trim()
    ? tempUser.phone.trim()
    : null,

        address: null,

        email:
          tempUser.email,

        hashed_password:
          tempUser.hashed_password
      });
  }

  await userRepository.deleteTempUser(
    tempUser.temp_user_id
  );

  await emailService.sendWelcomeEmail(
    tempUser.email,
    tempUser.first_name || tempUser.contact_person,
    tempUser.user_type
  );

  const token =
    tokenService.generateToken({

      id:
        user.customer_id ||
        user.supplier_id,

      email:
        user.email,

      role:
        tempUser.user_type
    });

  return {
    user,
    token
  };
};


const resendVerification = async ({ email, role }) => {

  const tempUser =
    await userRepository.findTempUserByEmailAndType(email, role);

  if (!tempUser) {
    throw new ApiError(
      404,
      "No pending verification found. Please sign up again."
    );
  }

  const emailCode =
    Math.floor(100000 + Math.random() * 900000).toString();

  await userRepository.updateTempUserEmailCode(
    tempUser.temp_user_id,
    {
      email_verification_code: emailCode,
      email_code_expires_at: new Date(Date.now() + 10 * 60 * 1000)
    }
  );

  await emailService.sendVerificationEmail(email, emailCode);

  return { email };
};



const login = async ({
  email,
  password,
  role
}) => {

  email = email.trim().toLowerCase();

  const user =
    await userRepository.findByEmailAndRole(
      email,
      role
    );

  if (!user) {
    throw new ApiError(
      401,
      "Invalid credentials"
    );
  }

  const isPasswordValid =
    await bcrypt.compare(
      password,
      user.hashed_password
    );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid credentials"
    );
  }

  const token =
    tokenService.generateToken({

      id:
        user.customer_id ||
        user.supplier_id ||
        user.admin_id,

      email:
        user.email,

      role
    });

  const {
    hashed_password,
    ...safeUser
  } = user;

  return {
    user: safeUser,
    token
  };
};



// Step 1: validate credentials, send 2FA code
const initiateLogin = async ({ email, password, role }) => {
  email = email.trim().toLowerCase();

  const user = await userRepository.findByEmailAndRole(email, role);

  if (!user) throw new ApiError(401, "Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  await userRepository.createLoginCode({ email, role, code, expires_at });
  await sendLoginCodeEmail(email, code, role);

  return { requiresCode: true, email, role };
};

// Step 2: verify 2FA code, return token
const verifyLoginCode = async ({ email, role, code }) => {
  email = email.trim().toLowerCase();

  const record = await userRepository.findLoginCode({ email, role, code });

  if (!record) throw new ApiError(400, "Invalid verification code");

  if (new Date(record.expires_at) < new Date()) {
    await userRepository.markLoginCodeUsed(record.id);
    throw new ApiError(400, "Verification code expired");
  }

  await userRepository.markLoginCodeUsed(record.id);

  const user = await userRepository.findByEmailAndRole(email, role);

  const token = tokenService.generateToken({
    id: user.customer_id || user.supplier_id || user.admin_id,
    email: user.email,
    role,
  });

  const { hashed_password, ...safeUser } = user;

  return { user: safeUser, token };
};



module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  initiateLogin,
  verifyLoginCode,
};
