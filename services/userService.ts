import UserModel, { IUser } from '../models/userModel'; // Importa o seu UserModel
import bcrypt from 'bcryptjs'; // Para comparar senhas no login
import crypto from 'crypto'; // Para gerar tokens de reset de senha

// Interfaces para tipar os dados de entrada (idealmente, viriam de DTOs validados)
interface RegisterUserInput {
  email: string;
  password?: string; // A validação de obrigatoriedade e tamanho está no Schema do Model
  name?: string;
}

interface LoginUserInput {
  email: string;
  password?: string; // A validação de obrigatoriedade está no Schema
}

// Classe de erro customizada simples (você pode expandir isso)
class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UserService {
  private frontendURL: string;

  constructor() {
    this.frontendURL = process.env.FRONTEND_URL || 'http://localhost:3001'; // URL base do seu frontend

    if (process.env.FRONTEND_URL === undefined) {
        console.warn(
            'ALERTA: FRONTEND_URL não configurado no .env! Usando valor padrão http://localhost:3001 para links de email.'
          );
    }
  }

  /**
   * Registra um novo usuário.
   * A senha é hasheada pelo hook pre-save no UserModel.
   */
  public async registerUser(
    data: RegisterUserInput
  ): Promise<Omit<IUser, 'password' | 'comparePassword'>> {
    const { email, password, name } = data;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new AppError('Este email já está cadastrado.', 409); // 409 Conflict
    }

    const user = new UserModel({ email, password, name });
    await user.save();

    const userObject = user.toObject() as Omit<IUser, 'password' | 'comparePassword'> & { password?: string, comparePassword?: any };
    delete userObject.password;
    delete userObject.comparePassword;

    return userObject;
  }

  /**
   * Autentica um usuário.
   * Nesta versão, retorna apenas os dados do usuário após o login bem-sucedido.
   */
  public async loginUser(
    data: LoginUserInput
  ): Promise<Omit<IUser, 'password' | 'comparePassword'>> { // Retorna apenas o usuário
    const { email, password } = data;

    if (!email || !password) {
        throw new AppError('Email e senha são obrigatórios.', 400);
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Credenciais inválidas (email).', 401);
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new AppError('Credenciais inválidas (senha).', 401);
    }

    const userObject = user.toObject() as Omit<IUser, 'password' | 'comparePassword'> & { password?: string, comparePassword?: any };
    delete userObject.password;
    delete userObject.comparePassword;

    return userObject; // Retorna apenas o objeto do usuário, sem token
  }

  /**
   * Inicia o processo de "esqueci minha senha".
   * Gera um token de reset e (simula) o envio de email.
   */
  public async forgotPassword(email: string): Promise<{ message: string; resetTokenForDev?: string }> {
    if (!email) {
        throw new AppError('O email é obrigatório.', 400);
    }
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.warn(`Tentativa de reset de senha para email não cadastrado: ${email}`);
      return { message: 'Se existir uma conta com este email, um link para redefinição de senha foi enviado.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 3600000); // Expira em 1 hora

    await user.save();

    const resetURL = `${this.frontendURL}/reset-password/${resetToken}`;
    console.log(`------------------------------------------------------------------`);
    console.log(`EMAIL SIMULADO PARA: ${user.email}`);
    console.log(`Token de Reset (original, para enviar por email): ${resetToken}`);
    console.log(`URL de Reset (para o link no email): ${resetURL}`);
    console.log(`------------------------------------------------------------------`);

    return {
        message: 'Se existir uma conta com este email, um link para redefinição de senha foi enviado.',
        resetTokenForDev: resetToken
    };
  }

  /**
   * Redefine a senha do usuário usando um token de reset válido.
   */
  public async resetPassword(token: string, newPasswordInput: string): Promise<{ message: string }> {
    if (!token || !newPasswordInput) {
        throw new AppError('Token e nova senha são obrigatórios.', 400);
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      throw new AppError('Token de redefinição de senha inválido ou expirado.', 400);
    }

    user.password = newPasswordInput;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;

    await user.save();

    return { message: 'Senha redefinida com sucesso.' };
  }
}