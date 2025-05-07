import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para tipar o documento do usuário
export interface IUser extends Document {
  email: string;
  name?: string; // O nome pode ser opcional
  password: string; // A senha será selecionada apenas quando necessário
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  // Protótipo de método para comparar senhas (a implementação real está abaixo)
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: [true, 'O email é obrigatório.'], // Adicionando mensagem de erro
      unique: true,
      lowercase: true,
      trim: true, // Remove espaços em branco no início e fim
      match: [/.+\@.+\..+/, 'Por favor, insira um email válido.'], // Validação simples de email
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'], // Mínimo de 6 caracteres
      select: false, // Para não retornar a senha por padrão nas buscas
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Adiciona os campos createdAt e updatedAt automaticamente
  }
);

// Middleware (hook) do Mongoose: Antes de 'save', hashear a senha se ela foi modificada
UserSchema.pre<IUser>('save', async function (next) {
  // 'this' se refere ao documento do usuário que está sendo salvo
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // "Salt" para o hash
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    // Se houver um erro ao hashear, passamos o erro para o próximo middleware/save
    next(error);
  }
});

// Método para comparar a senha candidata com a senha hasheada no banco
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // 'this.password' aqui se refere à senha hasheada do documento atual.
  // Como o campo password tem `select: false`, ele não estará disponível
  // a menos que você o peça explicitamente na query (ex: .select('+password')).
  // Se você chegou aqui e this.password não existe, algo está errado na query que buscou o usuário.
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Criando o modelo:
// 1º argumento: Nome do modelo (para uso no Mongoose, ex: 'User')
// 2º argumento: O Schema que define a estrutura
// 3º argumento: O NOME DA COLLECTION no MongoDB (você quer "user")
const UserModel = mongoose.model<IUser>('User', UserSchema, 'user');

export default UserModel;