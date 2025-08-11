// src/pages/CourseDetail.jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStudents } from '../services/student.service';
import CourseStatsChart from '../components/CourseStatsChart';

const CourseDetail = () => {
  const { id } = useParams();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const all = await getStudents();
        setStudents(all.filter(s => s.curso?._id === id));
      } catch (err) {
        console.error('Error cargando estudiantes:', err);
      }
    })();
  }, [id]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl border-l-[350px] border-[#71747a] font-semibold mb-4">
        Estudiantes del curso
      </h2>

      {students.length === 0 ? (
        <p className="text-gray-500">Sin estudiantes.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2 border-l-[150px] border-[#71747a]">
          {students.map(s => (
            <li key={s._id}>
              <Link
                to={`/estudiantes/${s._id}`}
                className="text-blue-600 hover:underline"
              >
                {s.nombre}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Gráfica de aciertos</h3>
        <CourseStatsChart courseId={id} />
      </div>
    </div>
  );
};

export default CourseDetail;
