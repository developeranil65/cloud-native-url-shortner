import Url from '../models/Url.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Redirect to original URL
// @route   GET /:shortCode
// @access  Public
export const redirectUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode });

  if (url) {
    // Increment click count
    url.clickCount += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } else {
    res.status(404);
    throw new Error('URL not found');
  }
});
