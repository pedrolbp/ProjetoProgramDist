import User from '../models/User.js';

const registerUserService = async (name, password, emailAsLogin) => {
    const existingUser = await User.findOne({ login: emailAsLogin });
    if (existingUser) {
        throw new Error('User with this login already exists');
    }

    const newUser = new User({
        name,
        login: emailAsLogin,
        password: password,
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

    else if (user.password !== password) {
        throw new Error('Invalid credentials');
    }

    else if (!user.emailConfirmed) {
        throw new Error('User not confirmed yet. Please confirm your email.');
    }
    
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
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