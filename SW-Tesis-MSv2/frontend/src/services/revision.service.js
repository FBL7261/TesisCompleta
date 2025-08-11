import axios from './root.service';
import cookies from 'js-cookie';

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/reviews`;

const getAuthHeader = () => {
  const token = cookies.get('jwt-auth');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getRevisions = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener las revisiones:', error);
    throw error;
  }
};

export const createRevision = async (revision) => {
  try {
    const response = await axios.post(API_URL, revision, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al crear la revisión:', error);
    throw error;
  }
};

export const getRevisionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/student/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener la revisión con id ${id}:`, error);
    throw error;
  }
};

export const deleteRevision = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/student/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al eliminar la revisión con id ${id}:`, error);
    throw error;
  }
};
