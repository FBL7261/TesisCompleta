import { useEffect, useState } from 'react';
import {
  getStudents,
  deleteStudent,
} from '../services/student.service';

const StudentList = ({ reloadTrigger }) => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar estudiante?')) return;
    await deleteStudent(id);
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, [reloadTrigger]);

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-xl font-bold">Estudiantes Registrados</h2>
      {students.length === 0 ? (
        <p className="text-gray-500">No hay estudiantes.</p>
      ) : (
        <ul className="space-y-2">
          {students.map(student => (
            <li
              key={student._id}
              className="bg-gray-100 p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{student.nombre}</p>
                <p className="text-sm text-gray-600">
                  Curso: {student.curso?.nombre || 'Sin curso asignado'}</p>
              </div>
              <button
                onClick={() => handleDelete(student._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentList;
