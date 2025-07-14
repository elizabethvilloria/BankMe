const express = require('express');
const router = express.Router();
const billsController = require('../controllers/billsController');

router.get('/', billsController.getAllBills);
router.post('/', billsController.createBill);
router.put('/:id', billsController.updateBill);
router.delete('/:id', billsController.deleteBill);
router.patch('/:id/toggle', billsController.toggleBillPaid);
router.get('/upcoming', billsController.getUpcomingBills);

module.exports = router; 