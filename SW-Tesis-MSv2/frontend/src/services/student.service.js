import axios from './root.service';
import cookies from 'js-cookie';

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/students`;

const getAuthHeader = () => {
  const token = cookies.get('jwt-auth');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getStudents = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener los estudiantes:', error);
    throw error;
  }
};

export const createStudent = async (student) => {
  try {
    const response = await axios.post(API_URL, student, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creando el estudiante:', error);
    throw error;
  }
};


export const getStudentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener el estudiante con id ${id}:`, error);
    throw error;
  }
};

export const updateStudent = async (id, updatedStudent) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedStudent, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al actualizar el estudiante con id ${id}:`, error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al eliminar el estudiante con id ${id}:`, error);
    throw error;
  }
};
