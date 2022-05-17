const express = require('express');
const customDocumentTypeController = require('../controllers/customDocumentTypeController');
const authController = require('../controllers/authController');
const Employee = require("../models/employeeModel");
// ROUTES 
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));

router.use(authController.protect(Employee));

router.route('/documentTab')
    .get(customDocumentTypeController.getDocumentTabs);
// /schema?documentType=
router.route('/documentSchema')
    .get(customDocumentTypeController.getDocumentSchema);

// router.route('/documentTabList/:id')
//     .get(customDocumentTypeController.findCustomDocumentSchemaTabs);

router.route('/customDocument')
    .get(customDocumentTypeController.getAllCustomDocuments)
    .post(customDocumentTypeController.createOneCustomDocument);

router.route('/customDocument/:id/histories')
    .get(customDocumentTypeController.getHistories)

router.route('/customDocument/:id')
    .get(customDocumentTypeController.getOneCustomDocument)
    .patch(customDocumentTypeController.updateOneCustomDocument)
    .delete(customDocumentTypeController.deleteOneCustomDocument);


// /customDocumentType/customField?docType=6246e54098b5587014d4d209
router.route('/customField')
    .get(customDocumentTypeController.getAllFields)
    .post(customDocumentTypeController.createOneField);

// /customDocumentType/customField/:id?docType=6246e54098b5587014d4d209
router.route('/customField/:id')
    .get(customDocumentTypeController.getOneField)
    .patch(customDocumentTypeController.updateOneField)
    .delete(customDocumentTypeController.deleteOneField);



// router.route('/addField/:id')
//     .patch(customDocumentTypeController.addField);

router.route('/')
    .get(customDocumentTypeController.getAll)
    .post(customDocumentTypeController.createOne);


router.route('/:id')
    .get(customDocumentTypeController.getOne)
    .patch(customDocumentTypeController.updateOne)
    .delete(customDocumentTypeController.deleteOne);

router.route('/:id/histories')
    .get(customDocumentTypeController.getOne)

module.exports = router