import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import clientRoutes from './routes/clientRoutes.js';
import { authMiddleware, loginMiddleware } from './middleware/authMiddleware.js';
import { configSession } from './config/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (important for production deployments like Render, Heroku)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  console.log('[SERVER] Production mode: Trust proxy enabled');
} else {
  console.log('[SERVER] Development mode: Trust proxy disabled');
}

// Session configuration
app.use(session(configSession));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', loginMiddleware, (req, res) => {
  res.redirect('/login');
});

app.get('/login', loginMiddleware, (req, res) => {
  console.log('[LOGIN] Login page requested');
  console.log('[LOGIN] Session exists:', !!req.session);
  console.log('[LOGIN] Is authenticated:', req.session?.isAuthenticated);
  res.render('login', { title: 'Login - Brajdarpan Guruvani Kendra' });
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  
  console.log('[LOGIN] Login attempt received');
  console.log('[LOGIN] Request IP:', req.ip);
  console.log('[LOGIN] Request headers:', {
    'user-agent': req.get('user-agent'),
    'x-forwarded-for': req.get('x-forwarded-for')
  });
  
  if (!password) {
    console.log('[LOGIN] Error: No password provided');
    return res.json({ success: false, message: 'Password is required' });
  }
  
  if (password === 'Ritik') {
    console.log('[LOGIN] Password correct, creating session...');
    req.session.isAuthenticated = true;
    
    // Explicitly save session to ensure it persists
    req.session.save((err) => {
      if (err) {
        console.error('[LOGIN] Session save error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Session error. Please try again.' 
        });
      }
      console.log('[LOGIN] Session saved successfully');
      console.log('[LOGIN] Session ID:', req.sessionID);
      console.log('[LOGIN] Session data:', {
        isAuthenticated: req.session.isAuthenticated,
        cookie: req.session.cookie
      });
      res.json({ success: true, message: 'Login successful' });
    });
  } else {
    console.log('[LOGIN] Invalid password attempt');
    res.json({ success: false, message: 'Invalid password' });
  }
});

app.get('/logout', (req, res) => {
  console.log('[LOGOUT] Logout request received');
  console.log('[LOGOUT] Session ID:', req.session?.id);
  
  // Get session cookie name from session store
  const sessionCookieName = req.session?.cookie?.name || 'connect.sid';
  console.log('[LOGOUT] Cookie name:', sessionCookieName);
  
  // Clear session cookie first
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production' // true for HTTPS in production
  });
  console.log('[LOGOUT] Cookie cleared');
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('[LOGOUT] Error destroying session:', err);
    } else {
      console.log('[LOGOUT] Session destroyed successfully');
    }
    // Redirect to login page with status 302
    console.log('[LOGOUT] Redirecting to login');
    res.status(302).redirect('/login');
  });
});

// Protected routes
app.use('/api/clients', authMiddleware, clientRoutes);
app.get('/dashboard', authMiddleware, (req, res) => {
  console.log('[DASHBOARD] Dashboard page requested');
  console.log('[DASHBOARD] Session ID:', req.session?.id);
  res.render('dashboard', { title: 'Dashboard - Brajdarpan Guruvani Kendra' });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`[SERVER] Server running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] Trust proxy: ${process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'}`);
  console.log(`[SERVER] Visit http://localhost:${PORT} to access the application`);
  console.log('='.repeat(50));
});

