const isProduction = process.env.NODE_ENV === 'production';

export const configSession = {
  secret: process.env.SESSION_SECRET || 'brajdarpan-guruvani-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Render provides HTTPS, so secure should be true in production
    // But with trust proxy, it will work correctly
    secure: isProduction ? true : false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Better compatibility with cross-site requests
  }
};

// Log session configuration on startup
if (isProduction) {
  console.log('[SESSION] Production mode: Secure cookies enabled');
  console.log('[SESSION] Session secret:', process.env.SESSION_SECRET ? 'Set (custom)' : 'Using default');
} else {
  console.log('[SESSION] Development mode: Secure cookies disabled');
}

