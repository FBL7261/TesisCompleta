import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCourseRevisionStats } from '../services/stats.service';

const COLORS = ['#22c55e', '#ef4444']; // verde, rojo

export default function CourseStatsChart({ courseId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCourseRevisionStats(courseId)
      .then(({ correct, incorrect }) => {
        setData([
          { name: 'Correctas', value: correct },
          { name: 'Incorrectas', value: incorrect }
        ]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <p>Cargando estadísticas…</p>;
  if (data.every(d => d.value === 0)) return <p>No hay datos para graficar.</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%" cy="50%"
          outerRadius={80}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Respuestas']} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
