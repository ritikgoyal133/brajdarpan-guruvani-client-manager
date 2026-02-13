// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import session from 'express-session';
import clientRoutes from './routes/clientRoutes.js';
import { authMiddleware, loginMiddleware } from './middleware/authMiddleware.js';
import { configSession } from './config/session.js';
import { connectDB } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;
const systemPassword = process.env.SYSTEM_PASSWORD;

// Trust proxy (important for production deployments like Render, Heroku)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
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
  res.render('login', { title: 'Login - Brajdarpan Guruvani Kendra' });
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.json({ success: false, message: 'Password is required' });
  }
  
  if (password === systemPassword) {
    req.session.isAuthenticated = true;
    
    // Explicitly save session to ensure it persists
    req.session.save((err) => {
      if (err) {
        console.error('[LOGIN] Session save error:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Session error. Please try again.',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
      res.json({ success: true, message: 'Login successful' });
    });
  } else {
    res.json({ success: false, message: 'Invalid password' });
  }
});

app.get('/logout', (req, res) => {
  // Get session cookie name from session store
  const sessionCookieName = req.session?.cookie?.name || 'connect.sid';
  
  // Clear session cookie first
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production' // true for HTTPS in production
  });
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('[LOGOUT] Error destroying session:', err.message);
    }
    // Redirect to login page with status 302
    res.status(302).redirect('/login');
  });
});

// Protected routes
app.use('/api/clients', authMiddleware, clientRoutes);
app.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { title: 'Dashboard - Brajdarpan Guruvani Kendra' });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`[SERVER] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error('[SERVER] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

