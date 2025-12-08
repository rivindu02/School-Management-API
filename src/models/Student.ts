// src/models/Student.ts
import mongoose, { Schema, Document } from 'mongoose';

// 1. The TypeScript Interface - Tells TypeScript what data types to expect
export interface IStudent extends Document {
  name: string;
  email: string;
  age: number;
  //course: string; <- before
  // Relationship: A Student takes multiple courses
  courses: mongoose.Types.ObjectId[];
}

// 2. The Mongoose Schema - Tells Mongoose how to store it in the database.
const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  //course: { type: String, required: true } <---before
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }] // this is after adding reference to Course model]
});

// 3. Export the Model
export default mongoose.model<IStudent>('Student', StudentSchema);