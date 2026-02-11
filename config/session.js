export const configSession = {
  secret: process.env.SESSION_SECRET || 'brajdarpan-guruvani-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' ? true : false, // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Better compatibility with incognito mode
  }
};

