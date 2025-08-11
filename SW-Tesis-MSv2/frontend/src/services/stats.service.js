import axios from './root.service';

export const getCourseRevisionStats = async (courseId) => {
  const res = await axios.get(`/stats/course/${courseId}`);
  return res.data;
};
