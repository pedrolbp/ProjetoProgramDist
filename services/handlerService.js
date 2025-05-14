import bcrypt from 'bcrypt';

const generateTokenService = (userId, userRole)  => {
    return jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
};

export { generateTokenService, hashPassword }