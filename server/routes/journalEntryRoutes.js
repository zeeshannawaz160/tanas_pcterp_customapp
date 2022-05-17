const express = require('express');
const journalEntryController = require('../controllers/journalEntryController');
const authController = require('../controllers/authController');

// ROUTES 
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/')
    .get(journalEntryController.getAllJournalEntrys)
    .post(journalEntryController.createJournalEntry);


router.route('/:id')
    .get(journalEntryController.getJournalEntry)
    .patch(journalEntryController.updateJournalEntry)
    .delete(journalEntryController.deleteJournalEntry);

module.exports = router