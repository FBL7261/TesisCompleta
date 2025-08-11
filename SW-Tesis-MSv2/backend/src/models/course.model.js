import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    versionKey: false,
  },
);

const Course = mongoose.model('Course', courseSchema);
export default Course;