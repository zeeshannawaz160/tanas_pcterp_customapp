const express = require('express');
const appCenterController = require('../controllers/appCenterController');
const authController = require('../controllers/authController');
const Employee = require('../models/employeeModel');

// ROUTES 
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));

router.use(authController.protect(Employee));
router.route('/')
    .get(appCenterController.getAll)
    .post(appCenterController.createOne);


router.route('/:id')
    .get(appCenterController.getOne)
    .patch(appCenterController.updateOne)
    .delete(appCenterController.deleteOne);

module.exports = router