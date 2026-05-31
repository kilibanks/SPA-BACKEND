const express = require("express");
const router = express.Router();
const { pool } = require("../../config/db");
const ApiResponse = require("../../utils/ApiResponse");

// Get all categories
router.get("/", async (req, res, next) => {
  try {
    const [categories] = await pool.query(
      "SELECT category_id, name, description, created_at FROM service_categories ORDER BY name ASC"
    );
    return res
      .status(200)
      .json(ApiResponse.success("Categories fetched successfully", categories));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
