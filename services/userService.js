import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

const registerUserService = async (name, password, emailAsLogin) => {
    const existingUser = await User.findOne({ login: emailAsLogin });
    if (existingUser) {
        throw new Error('User with this login already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);//hash da senha

    const newUser = new User({
        name,
        login: emailAsLogin,
        password: hashedPassword, 
        emailConfirmed: false
    });

    await newUser.save();
    const userObject = newUser.toObject();
    delete userObject.password;
    return userObject;
};

const loginUserService = async (emailAsLogin, password) => {
    const user = await User.findOne({ login: emailAsLogin });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }

    if (!user.emailConfirmed) {
        throw new Error('User not confirmed yet. Please confirm your email.');
    }

    // gera o token JWT
    const token = jwt.sign(
        { id: user._id, login: user.login },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token }; //retornando o token
};

const forgotPasswordService = async (emailAsLogin) => {
    const user = await User.findOne({ login: emailAsLogin });

    if (!user) {
        throw new Error(`If a user with login ${emailAsLogin} exists, further instructions for password reset would be processed here.`);
    }

    return { message: `If a user with login ${emailAsLogin} exists, further instructions for password reset would be processed here.` };
};

export {
    registerUserService,
    loginUserService,
    forgotPasswordService
};