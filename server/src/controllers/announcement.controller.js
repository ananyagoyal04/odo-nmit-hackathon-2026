const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/announcements
 */
const getAnnouncements = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const announcements = await db.getAnnouncements(req.companyId, { category });

  res.status(200).json({
    success: true,
    total: announcements.length,
    announcements
  });
});

/**
 * POST /api/announcements
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, category = 'General', pinned = false, tags = [] } = req.body;
  if (!title || !content) {
    throw ApiError.badRequest('Title and content are required.');
  }

  const announcement = await db.createAnnouncement({
    companyId: req.companyId,
    authorId: req.user._id,
    title,
    content,
    category,
    pinned: Boolean(pinned),
    tags
  });

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'ANNOUNCEMENT_CREATE',
    targetType: 'Announcement',
    targetId: announcement.id,
    metadata: { title },
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    success: true,
    message: 'Announcement published successfully in MySQL',
    announcement
  });
});

/**
 * DELETE /api/announcements/:id
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  await db.deleteAnnouncement(req.params.id, req.companyId);

  res.status(200).json({
    success: true,
    message: 'Announcement removed successfully.'
  });
});

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
