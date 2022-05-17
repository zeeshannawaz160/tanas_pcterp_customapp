const express = require('express');
const jobOrderController = require('../controllers/jobOrderController');
const authController = require('../controllers/authController');

// ROUTES 
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/')
    .get(jobOrderController.getAll)
    .post(jobOrderController.createOne);


router.route('/:id')
    .get(jobOrderController.getOne)
    .patch(jobOrderController.updateOne)
    .delete(jobOrderController.deleteOne);

module.exports = router