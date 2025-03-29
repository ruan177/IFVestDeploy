const session = require('express-session');

const sessionOptions = {
    secret: 'frasealeatoria',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        secure: false // Altere para true se usar HTTPS
    },
    rolling: true,
    genid: (req) => {
      console.log('Session ID generation:', req.sessionID);
      return req.sessionID;
    }
};



module.exports = sessionOptions;
