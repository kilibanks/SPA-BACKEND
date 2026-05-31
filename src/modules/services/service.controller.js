const serviceService = require("./service.service");
const ApiResponse = require("../../utils/ApiResponse");

const getAllServices = async (req, res, next) => {
  try {
    const services = await serviceService.getAllServices();
    return res
      .status(200)
      .json(
        ApiResponse.success("Services fetched successfully", services),
      );
  } catch (error) {
    next(error);
  }
};

const getAvailableServices = async (req, res, next) => {
  try {
    const services = await serviceService.getAvailableServices();
    return res
      .status(200)
      .json(
        ApiResponse.success("Available services fetched successfully", services),
      );
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    return res
      .status(200)
      .json(
        ApiResponse.success("Service fetched successfully", service),
      );
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.body);
    return res
      .status(201)
      .json(
        ApiResponse.success("Service created successfully", service),
      );
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(
      req.params.id,
      req.body,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Service updated successfully", service),
      );
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    await serviceService.deleteService(req.params.id);
    return res
      .status(200)
      .json(
        ApiResponse.success("Service deleted successfully"),
      );
  } catch (error) {
    next(error);
  }
};

const getServicesByCategory = async (req, res, next) => {
  try {
    const services = await serviceService.getServicesByCategory(req.params.categoryId);
    return res
      .status(200)
      .json(
        ApiResponse.success("Services fetched successfully", services),
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  getAvailableServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
};