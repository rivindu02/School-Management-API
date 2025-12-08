// src/models/Teacher.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  email: string;
  // Relationship: A Teacher teaches multiple courses
  courses: mongoose.Types.ObjectId[]; 
}

const TeacherSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // This array stores the IDs of the courses
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]   // this is after adding reference to Course model
});

export default mongoose.model<ITeacher>('Teacher', TeacherSchema);