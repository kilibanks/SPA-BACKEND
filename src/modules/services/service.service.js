const serviceRepository = require("./service.repository");
const ApiError = require("../../utils/ApiError");

const getAllServices = async () => {
  const services = await serviceRepository.getAllServices();
  return services;
};

const getAvailableServices = async () => {
  const services = await serviceRepository.getAvailableServices();
  return services;
};

const getServiceById = async (id) => {
  const service = await serviceRepository.getServiceById(id);
  if (!service) {
    throw new ApiError(404, "Service not found");
  }
  return service;
};

const createService = async ({
  title,
  service_name,
  description,
  price,
  duration_minutes,
  status,
}) => {
  if (!title || !price || !duration_minutes) {
    throw new ApiError(400, "Title, price, and duration_minutes are required");
  }

  const service = await serviceRepository.createService({
    title,
    service_name: service_name || title,
    description,
    price,
    duration_minutes,
    status,
  });

  return service;
};

const updateService = async (id, updateData) => {
  const existingService = await serviceRepository.getServiceById(id);
  if (!existingService) {
    throw new ApiError(404, "Service not found");
  }

  const service = await serviceRepository.updateService(id, updateData);
  return service;
};

const deleteService = async (id) => {
  const existingService = await serviceRepository.getServiceById(id);
  if (!existingService) {
    throw new ApiError(404, "Service not found");
  }

  const deleted = await serviceRepository.deleteService(id);
  if (!deleted) {
    throw new ApiError(500, "Failed to delete service");
  }
};

const getServicesByCategory = async (categoryId) => {
  const services = await serviceRepository.getServicesByCategory(categoryId);
  return services;
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
