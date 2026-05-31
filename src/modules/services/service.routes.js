const express = require("express");
const router = express.Router();
const serviceController = require("./service.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  createServiceSchema,
  updateServiceSchema,
} = require("./service.validation");

// Public routes - anyone can view available services
router.get("/available", serviceController.getAvailableServices);
router.get("/category/:categoryId", serviceController.getServicesByCategory);
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);

// Protected routes - admin only (for creating/updating/deleting services)
router.use(authMiddleware);

router.post(
  "/",
  validate(createServiceSchema),
  serviceController.createService,
);

router.patch(
  "/:id",
  validate(updateServiceSchema),
  serviceController.updateService,
);

router.delete("/:id", serviceController.deleteService);

module.exports = router;
