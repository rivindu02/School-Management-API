// src/models/Course.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  code: string; // e.g., "EE201"
  credits: number;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  credits: { type: Number, required: true }
});

export default mongoose.model<ICourse>('Course', CourseSchema);