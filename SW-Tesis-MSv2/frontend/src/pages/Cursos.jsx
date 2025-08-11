import CourseList from '../components/CourseList';

const Cursos = () => {
  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Gestión de Cursos
      </h1>
      <CourseList />
    </div>
  );
};

export default Cursos;
