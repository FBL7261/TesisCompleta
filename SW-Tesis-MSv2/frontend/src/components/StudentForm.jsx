import { useState, useEffect } from 'react';
import { createStudent } from '../services/student.service';
import { getCourses } from '../services/course.service';

const StudentForm = ({ onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [curso, setCurso] = useState('');
  const [cursos, setCursos] = useState([]);

  const fetchCursos = async () => {
    try {
      const data = await getCourses();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !curso) return alert('Completa todos los campos');
    try {
      await createStudent({ nombre, curso });
      setNombre('');
      setCurso('');
      onCreated?.();
    } catch (error) {
      console.error('Error al crear estudiante:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del estudiante"
        className="border p-2 rounded w-full"
      />
      <select
        value={curso}
        onChange={(e) => setCurso(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Selecciona un curso</option>
        {cursos.map(c => (
          <option key={c._id} value={c._id}>{c.nombre}</option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Asignar estudiante
      </button>
    </form>
  );
};

export default StudentForm;
