const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const getPlans = require('../controllers/getPlans');
const {doneReport} = require('../controllers/doneReport')
const {toVerifyReport} = require('../controllers/toVerifyReport')
const authenticateToken = require('../middlewares/authenticateToken')
const {
  getRecentEvents,
  updateEventReason
} = require('../controllers/doneEvent');

router.get('/events',authenticateToken, getRecentEvents);
router.put('/events/:id', updateEventReason);


router.post('/login', authController.login);
router.get('/getPlans/:sheetName',authenticateToken, getPlans);
router.post('/report',authenticateToken, doneReport)
router.post('/toverify',authenticateToken, toVerifyReport)

router.get('/me', authController.checkAuth);



//wylogowanie
router.post('/logout', authController.logout);

module.exports = router;
