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
  if (password === 'Ritik') {
    req.session.isAuthenticated = true;
    res.json({ success: true, message: 'Login successful' });
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
    secure: false // false for localhost, true for HTTPS in production
  });
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});

