import User from '../models/User.js';

const registerUserControler = async (req, res) => {
    const { name, password, email } = req.body;

    try {
        const newUser = await registerUserService(name, password, email);
        return res.status(200).json({message: 'user registered successfully, please confirm your email', user: newUser});
    } catch (err) {
        return res.status(401).json({error: err.message});
    }
};

const loginUserControler = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } })

    if (!user.emailConfirmed) {
        return res.status(401).json({ error: 'User not confirmed yet' });
    }

    try{
        const user = await loginUserService(email, password);
        return res.status(200).json({ message: 'login successfully', user: user });
    } catch(err){
        return res.status(401).json({ error: err.message }); 
    }
};

const forgotPasswordController = async (req, res) => {
    const { email } = req.body;

    try {
        await forgotPasswordService(email);
        return res.status(200).json({ message: `Email sent to ${email}` });
    } catch (err) {
        return res.status(401).json({ error: err.message });
    };
};

export { registerUserControler, loginUserControler, forgotPasswordController };