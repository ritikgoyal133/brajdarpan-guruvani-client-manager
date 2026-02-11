export const authMiddleware = (req, res, next) => {
  console.log('[AUTH] Checking authentication for:', req.path);
  console.log('[AUTH] Session exists:', !!req.session);
  console.log('[AUTH] Session ID:', req.session?.id);
  console.log('[AUTH] Is authenticated:', req.session?.isAuthenticated);
  
  if (req.session && req.session.isAuthenticated) {
    console.log('[AUTH] Authentication successful, allowing access');
    return next();
  } else {
    console.log('[AUTH] Authentication failed - no valid session');
    // For API routes, return 401 status
    if (req.path.startsWith('/api/')) {
      console.log('[AUTH] API route - returning 401');
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }
    // For regular routes, redirect to login
    console.log('[AUTH] Redirecting to login');
    return res.redirect('/login');
  }
};

export const loginMiddleware = (req, res, next) => {
  console.log('[LOGIN_MIDDLEWARE] Checking if already authenticated');
  console.log('[LOGIN_MIDDLEWARE] Session exists:', !!req.session);
  console.log('[LOGIN_MIDDLEWARE] Is authenticated:', req.session?.isAuthenticated);
  
  if (req.session && req.session.isAuthenticated) {
    console.log('[LOGIN_MIDDLEWARE] Already authenticated, redirecting to dashboard');
    return res.redirect('/dashboard');
  } else {
    console.log('[LOGIN_MIDDLEWARE] Not authenticated, showing login page');
    return next();
  }
};

