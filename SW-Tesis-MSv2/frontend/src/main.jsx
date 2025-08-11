import ReactDOM from 'react-dom/client';
import App from './routes/App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './routes/Root.jsx';
import ErrorPage from './routes/ErrorPage.jsx';
import Login from './routes/Login.jsx';
import Cursos from './pages/Cursos.jsx';
import Estudiantes from './pages/Estudiantes.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import StudentProfile from './pages/StudentProfile.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'cursos',
        element: <Cursos />,
      },
      {
        path: 'cursos/:id',
        element: <CourseDetail />,
      },
      {
        path: 'estudiantes',
        element: <Estudiantes />,
      },
      {
        path: 'estudiantes/:id',
        element: <StudentProfile />,
      },
    ],
  },
  {
    path: '/auth',
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
