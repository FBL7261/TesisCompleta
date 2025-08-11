import StudentForm from '../components/StudentForm';
import StudentList from '../components/StudentList';
import { useState } from 'react';

const Estudiantes = () => {
  const [reload, setReload] = useState(false);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-4">Gestión de Estudiantes</h1>
      <StudentForm onCreated={() => setReload(!reload)} />
      <StudentList reloadTrigger={reload} />
    </div>
  );
};

export default Estudiantes;
