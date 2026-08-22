const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcement.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdminOrHR } = require('../middlewares/rbac');

const router = express.Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post('/', isAdminOrHR, createAnnouncement);
router.delete('/:id', isAdminOrHR, deleteAnnouncement);

module.exports = router;
