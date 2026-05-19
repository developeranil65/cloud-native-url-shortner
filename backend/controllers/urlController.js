import Url from '../models/Url.js';
import { validateUrl } from '../utils/validateUrl.js';
import { generateShortCode } from '../utils/generateShortCode.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Create short URL
// @route   POST /api/shorten
// @access  Public
export const shortenUrl = asyncHandler(async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    res.status(400);
    throw new Error('Please provide a URL');
  }

  if (!validateUrl(originalUrl)) {
    res.status(400);
    throw new Error('Invalid URL format');
  }

  // Check if URL already exists
  let url = await Url.findOne({ originalUrl });
  if (url) {
    return res.status(200).json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`
    });
  }

  // Generate unique short code
  let shortCode;
  let isUnique = false;
  while (!isUnique) {
    shortCode = generateShortCode();
    const existingCode = await Url.findOne({ shortCode });
    if (!existingCode) {
      isUnique = true;
    }
  }

  // Create new URL entry
  url = await Url.create({
    originalUrl,
    shortCode
  });

  res.status(201).json({
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    shortUrl: `${process.env.BASE_URL}/${url.shortCode}`
  });
});

// @desc    Get all URLs stats
// @route   GET /api/urls
// @access  Public
export const getUrls = asyncHandler(async (req, res) => {
  const urls = await Url.find({}).sort({ createdAt: -1 });
  res.status(200).json(urls);
});
