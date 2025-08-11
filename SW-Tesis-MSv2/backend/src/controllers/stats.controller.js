import * as statsService from '../services/stats.service.js';
import Course from '../models/course.model.js';

export async function courseRevisionStats(req, res) {
  const { id: courseId } = req.params;

  try {

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    const agg = await statsService.courseRevisionStats(courseId);

    let correct = 0, incorrect = 0;
    agg.forEach(item => {
      if (item._id === true)    correct = item.count;
      else if (item._id === false) incorrect = item.count;
    });

    return res.status(200).json({ correct, incorrect });
  } catch (err) {
    console.error('Error en courseRevisionStats:', err);
    return res.status(500).json({ message: 'Error al obtener estadísticas de curso.' });
  }
}
