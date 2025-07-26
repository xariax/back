const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const getPlans = require('../controllers/getPlans');
const {doneReport} = require('../controllers/doneReport')
const {toVerifyReport} = require('../controllers/toVerifyReport')
const {
  getRecentEvents,
  updateEventReason
} = require('../controllers/doneEvent');

router.get('/events', getRecentEvents);
router.put('/events/:id', updateEventReason);


router.post('/login', authController.login);
router.get('/getPlans/:sheetName', getPlans);
router.post('/report', doneReport)
router.post('/toverify', toVerifyReport)

module.exports = router;
