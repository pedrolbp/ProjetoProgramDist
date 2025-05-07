const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

const generateTokenService = (userId, userRole)  => {
    return jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const hashPassword = async (newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    return hashedPassword

};

const isAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role != 'admin') {
            throw new Error('Access denied')
        }
            req.user = decoded;
            next();

    } catch (err) {
        return res.status(403).json({error: err.message});
    };
};

module.exports = { 
    authenticateToken,
    generateTokenService,
    hashPassword,
    isAdmin,
};