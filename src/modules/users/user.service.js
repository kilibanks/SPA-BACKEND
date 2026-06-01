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

const getCustomerById = async (id) => {
  const customer = await userRepository.findCustomerById(id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
};

const updateCustomer = async (id, data) => {
  const customer = await userRepository.findCustomerById(id);
  if (!customer) throw new ApiError(404, 'Customer not found');

  return await userRepository.updateCustomer(id, data);
};

const deleteCustomer = async (id) => {
  const customer = await userRepository.findCustomerById(id);
  if (!customer) throw new ApiError(404, 'Customer not found');

  await userRepository.deleteCustomer(id);
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

module.exports = { getAllUsers, getUserById, getDashboardStats, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, updateUser, deleteUser };
