export const authMiddleware = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  } else {
    // For API routes, return 401 status
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }
    // For regular routes, redirect to login
    return res.redirect('/login');
  }
};

export const loginMiddleware = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/dashboard');
  } else {
    return next();
  }
};

