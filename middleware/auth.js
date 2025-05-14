import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

exports.authenticateToken = (req, res, next) => {
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



exports.isAdmin = (req, res, next) => {
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
