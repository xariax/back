const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const getPlans = require('../controllers/getPlans');
const machineCheck = require('../controllers/machineCheck')
const {getStock} = require('../controllers/getStock')
const Reports = require('../controllers/Reports')
const authenticateToken = require('../middlewares/authenticateToken')
const {
  getRecentEvents,
  updateEventReason
} = require('../controllers/doneEvent');

const Basket =require('../controllers/Basket');
const { getOrders } = require('../controllers/getOrders');
const { getDataMachine } = require('../controllers/getDataMachine');


router.get('/user/machine', authenticateToken, machineCheck.getUserMachine)
router.get('/orders', authenticateToken, getOrders)
router.get('/getBasket', authenticateToken, Basket.getBasket)
router.get('/stock', authenticateToken, getStock)
router.get('/events',authenticateToken, getRecentEvents);
router.get('/getPlans/:sheetName',authenticateToken, getPlans);
router.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});
router.get('/DataMachine', authenticateToken, getDataMachine)

router.put('/events/:id', updateEventReason);

router.post('/user/machine', authenticateToken, machineCheck.updateUserMachine)
router.post('/BasketOrder', authenticateToken, Basket.BasketOrder)
router.post('/login', authController.login);
router.post('/addItemToBasket', authenticateToken, Basket.addItemToBasket)
router.post('/report',authenticateToken, Reports.doneReport)
router.post('/toverify',authenticateToken, Reports.toVerifyReport)



router.delete('/Basket/:id', authenticateToken, Basket.DeleteId)

//wylogowanie
router.post('/logout', authenticateToken, authController.logout);













module.exports = router;
