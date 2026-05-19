import { httpRequestDurationMicroseconds, httpRequestCount } from '../services/metricsService.js';

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    // Determine the route path (handling 404s and parameterized routes)
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(durationInSeconds);
      
    httpRequestCount
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

export default metricsMiddleware;
