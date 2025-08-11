// src/pages/StudentProfile.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStudentById } from '../services/student.service';
import { getRevisions } from '../services/revision.service';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loadingRevs, setLoadingRevs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stu = await getStudentById(id);
        setStudent(stu);
      } catch (err) {
        console.error('Error al cargar estudiante:', err);
      }

      setLoadingRevs(true);
      try {
        const allRevs = await getRevisions();
        const mine = Array.isArray(allRevs)
          ? allRevs.filter(r => {
              const sid = r.estudiante?._id || r.estudiante;
              return String(sid) === id;
            })
          : [];
        setRevisions(mine);
      } catch (err) {
        console.error('Error al cargar revisiones:', err);
      } finally {
        setLoadingRevs(false);
      }
    };

    fetchData();
  }, [id]);

  if (!student) return <p className="text-center">Cargando perfil…</p>;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{student.nombre}</h1>
        <p className="text-gray-700 dark:text-neutral-200">
          <strong>Curso:</strong> {student.curso?.nombre || 'No asignado'}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Revisiones</h2>

        {loadingRevs ? (
          <p>Cargando revisiones…</p>
        ) : revisions.length === 0 ? (
          <p className="text-gray-500">No hay revisiones para este estudiante.</p>
        ) : (
          <ul className="space-y-6">
            {revisions.map((rev, idx) => {
              const filename = rev.imagePath.split(/[/\\]/).pop();
              const fullUrl = `${import.meta.env.VITE_BASE_URL}/uploads/revisions/${filename}`;

              return (
                <li
                  key={rev._id}
                  className="border rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-neutral-700 border-b">
                    <span className="font-bold mr-2">{idx + 1}.</span>
                    <span
                      className={`font-medium ${
                        rev.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {rev.isCorrect ? 'Correcto' : 'Incorrecto'}
                    </span>
                  </div>

                  <div className="overflow-hidden bg-gray-100 dark:bg-neutral-800 h-48 flex items-center justify-center">
                    <img
                      src={fullUrl}
                      alt="Revisión"
                      className="max-h-full object-contain"
                    />
                  </div>

                  <div className="px-3 py-2 text-right text-sm text-gray-400">
                    {new Date(rev.createdAt).toLocaleString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
