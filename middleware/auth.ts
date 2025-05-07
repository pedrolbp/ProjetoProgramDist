import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

// estende Request para incluir o campo "user"
interface CustomRequest extends Request {
    user?: string | JwtPayload;
}

const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

const generateTokenService = (userId: string, userRole: string) => {
    const options: Record<string, any> = {
        expiresIn: process.env.JWT_EXPIRES_IN as string | number | undefined,
    };
    return jwt.sign(
        { id: userId, role: userRole },
        process.env.JWT_SECRET as string,
        options
    );
};


const hashPassword = async (newPassword: string) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    return hashedPassword;
};

const isAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if (decoded.role != 'admin') {
            throw new Error('Access denied');
        }
        req.user = decoded;
        next();

    } catch (err: any) {
        return res.status(403).json({ error: err.message });
    }
};

export {
    authenticateToken,
    generateTokenService,
    hashPassword,
    isAdmin,
};
