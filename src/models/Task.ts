import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);
