import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  role?: string;
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Por favor, introduce un email válido']
    },
    age: {
      type: Number,
      min: [0, 'La edad no puede ser negativa'],
      max: [120, 'La edad no puede ser mayor a 120 años'],
      validate: {
        validator: function(value: number) {
          // Permitir valores undefined o null
          if (value === undefined || value === null) return true;
          // Verificar que sea un número entero
          return Number.isInteger(value);
        },
        message: 'La edad debe ser un número entero'
      }
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'editor'],
        message: 'El rol {VALUE} no es válido'
      },
      default: 'user'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<IUser>('User', UserSchema);
