import axios from './root.service';
import cookies from 'js-cookie';

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/courses`;

const getAuthHeader = () => {
  const token = cookies.get('jwt-auth');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCourses = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    throw error;
  }
};

export const createCourse = async (course) => {
  try {
    const response = await axios.post(API_URL, course, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creando el curso:', error);
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener el curso con id ${id}:`, error);
    throw error;
  }
};

export const updateCourse = async (id, updatedCourse) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedCourse, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al actualizar el curso con id ${id}:`, error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al eliminar el curso con id ${id}:`, error);
    throw error;
  }
};
