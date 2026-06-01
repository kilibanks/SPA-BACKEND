const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json(ApiResponse.success('Users fetched successfully', users));
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    return res.status(200).json(ApiResponse.success('Profile fetched', user));
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json(ApiResponse.success('User fetched successfully', user));
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await userService.getDashboardStats();
    return res.status(200).json(ApiResponse.success('Dashboard stats fetched successfully', stats));
  } catch (error) {
    next(error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await userService.getAllCustomers();
    return res.status(200).json(ApiResponse.success('Customers fetched successfully', customers));
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await userService.getCustomerById(req.params.id);
    return res.status(200).json(ApiResponse.success('Customer fetched successfully', customer));
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await userService.updateCustomer(req.params.id, req.body);
    return res.status(200).json(ApiResponse.success('Customer updated successfully', customer));
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    await userService.deleteCustomer(req.params.id);
    return res.status(200).json(ApiResponse.success('Customer deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json(ApiResponse.success('User updated successfully', user));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(200).json(ApiResponse.success('User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getMe, getUserById, getAllCustomers, getCustomerById, getDashboardStats, updateCustomer, deleteCustomer, updateUser, deleteUser };
