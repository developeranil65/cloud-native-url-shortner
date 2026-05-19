import mongoose from 'mongoose';
import metricsRegister from '../services/metricsService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get system health status
// @route   GET /health
// @access  Public
export const getHealth = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// @desc    Get Prometheus metrics
// @route   GET /metrics
// @access  Public
export const getMetrics = asyncHandler(async (req, res) => {
  res.set('Content-Type', metricsRegister.contentType);
  const metrics = await metricsRegister.metrics();
  res.send(metrics);
});
