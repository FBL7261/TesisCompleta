// src/components/CourseList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses } from '../services/course.service';
import { getCourseRevisionStats } from '../services/stats.service';

const gradeOptions = [
  '1ro Básico','2do Básico','3ro Básico','4to Básico',
  '5to Básico','6to Básico','7mo Básico','8vo Básico'
];

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [statsByCourse, setStatsByCourse] = useState({});
  const [loadingStats, setLoadingStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const all = await getCourses();
        setCourses(Array.isArray(all) ? all : []);
      } catch {
        setCourses([]);
      }
    })();
  }, []);

  const sorted = gradeOptions
    .map(name => courses.find(c => c.nombre === name))
    .filter(Boolean);

  const handleShowStats = async (courseId) => {
    setLoadingStats(prev => ({ ...prev, [courseId]: true }));
    try {
      const data = await getCourseRevisionStats(courseId);
      setStatsByCourse(prev => ({ ...prev, [courseId]: data }));
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoadingStats(prev => ({ ...prev, [courseId]: false }));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl border-l-[350px] border-[#71747a] font-semibold">
        Cursos Disponibles
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 border-[#71747a] border-x-[200px]">
        {sorted.map(course => {
          const stats = statsByCourse[course._id];
          const loading = loadingStats[course._id];
          return (
            <div
              key={course._id}
              className="bg-white border-2 border-white shadow p-4 flex flex-col justify-between"
            >
              <h3 className="font-medium mb-4 border-l-[100px] border-[#71747a]">
                {course.nombre}
              </h3>

              <div className="flex justify-end space-x-2 mb-4">
                <button
                  onClick={() => navigate(`/cursos/${course._id}`)}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2
                    bg-primary-500 hover:bg-primary-600
                    text-white
                    rounded-md
                    transition
                    whitespace-nowrap
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Ver estudiantes
                </button>

                <button
                  onClick={() => handleShowStats(course._id)}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2
                    bg-primary-500 hover:bg-primary-600
                    text-white
                    rounded-md
                    transition
                    whitespace-nowrap
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Mostrar estadísticas'}
                </button>
              </div>

              {stats && (
                <div className="mt-4 bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                  <p className="text-sm">
                    Correctas: <strong>{stats.correct}</strong>
                  </p>
                  <p className="text-sm">
                    Incorrectas: <strong>{stats.incorrect}</strong>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseList;
