import mongoose from 'mongoose';
const { Schema } = mongoose;

const revisionSchema = new Schema({
  estudiante: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  imagePath: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model('Revision', revisionSchema);
