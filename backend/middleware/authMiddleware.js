const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const bearerToken = token.split(' ')[1];

    if (!bearerToken) {
        return res.status(403).json({ message: 'Malformed token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            console.error('FATAL: JWT_SECRET is not defined.');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        console.warn('WARNING: JWT_SECRET not defined, using default for dev');
    }

    jwt.verify(bearerToken, secret || 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
