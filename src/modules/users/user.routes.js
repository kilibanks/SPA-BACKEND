const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { updateUserSchema } = require('./user.validation');

// All user routes are protected
router.use(authMiddleware);

router.get('/', userController.getAllUsers);
router.get('/me', userController.getMe);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
