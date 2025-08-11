import { Outlet, NavLink } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

function Root() {
  return (
    <AuthProvider>
      <PageRoot />
    </AuthProvider>
  );
}

function PageRoot() {
  return (
    <div className="relative min-h-screen flex bg-gray-100 dark:bg-neutral-900 pt-10 px-4 text-red-500">

      <div className="relative border-t-[95px] border-[#71747a] px-4 py-2">
        <div className="relative border-x-[60px] border-[#71747a] px-4 py-2">
          <aside className="relative w-64 bg-red-700 dark:bg-red-700 text-blue shadow-md">
            <nav className="mt-10 flex flex-col space-y-10">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive
                    ? 'px-6 py-3 bg-red-700 dark:bg-red-900 text-white'
                    : 'px-6 py-3 hover:bg-red-600 dark:hover:bg-red-800'
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="/cursos"
                className={({ isActive }) =>
                  isActive
                    ? 'px-6 py-3 bg-red-700 dark:bg-red-900 text-white '
                    : 'px-6 py-3 hover:bg-red-600 dark:hover:bg-red-800'
                }
              >
                Cursos
              </NavLink>
            </nav>
          </aside>
        </div>
      </div>

      <div className="relative flex-1 p-6">
        <h1 className="relative text-2xl text-center font-bold mb-6 text-gray-800 dark:text-neutral-100">
          Plataforma Educativa
        </h1>

        <Outlet />
                
        <footer className="relative mt-10 text-center text-gray-500 dark:text-neutral-400">
          2025 Plataforma Educativa.
        </footer>
      </div>
    </div>
  );
}

export default Root;
