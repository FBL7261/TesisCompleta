// src/services/stats.service.js
import Revision from '../models/revision.model.js';
import mongoose from 'mongoose';

export async function courseRevisionStats(courseId) {
  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  return Revision.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'estudiante',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    {
      $match: {
        'student.curso': courseObjectId
      }
    },
    {
      $group: {
        _id: '$isCorrect',
        count: { $sum: 1 }
      }
    }
  ]);
}
