const userRepository = require('./user.repository');
const ApiError = require('../../utils/ApiError');

const getAllUsers = async () => {
  return await userRepository.findAll();
};

const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const getDashboardStats = async () => {
  const customers = await userRepository.countCustomers();
  const suppliers = await userRepository.countSuppliers();
  return { customers, suppliers };
};

const getAllCustomers = async () => {
  return await userRepository.findAllCustomers();
};

const updateUser = async (id, data) => {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  return await userRepository.update(id, data);
};

const deleteUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  await userRepository.remove(id);
};

module.exports = { getAllUsers, getUserById, getDashboardStats, getAllCustomers, updateUser, deleteUser };
