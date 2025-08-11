import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    revisiones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Revision',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Student = mongoose.model('Student', studentSchema);
export default Student;