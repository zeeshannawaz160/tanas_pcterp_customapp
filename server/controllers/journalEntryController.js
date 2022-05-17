const JournalEntry = require('../models/journalEntryModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllJournalEntrys = factory.getAll(JournalEntry, [{ path: 'createdBy' }, { path: 'subsidiary' }]);
exports.getJournalEntry = factory.getOne(JournalEntry);
exports.createJournalEntry = factory.createOne(JournalEntry);
exports.updateJournalEntry = factory.updateOne(JournalEntry);
exports.deleteJournalEntry = factory.deleteOne(JournalEntry);