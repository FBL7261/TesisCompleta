/*
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb+srv://felipeburgos1901:12345@cluster0.vvhuunc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME   = 'test';
const gradeOptions = [
  '1ro Básico','2do Básico','3ro Básico','4to Básico',
  '5to Básico','6to Básico','7mo Básico','8vo Básico'
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const courses = db.collection('courses');

  for (const nombre of gradeOptions) {
    await courses.updateOne(
      { nombre },
      { $setOnInsert: { nombre } },
      { upsert: true }
    );
    console.log(`✔️  Curso ${nombre} upserteado`);
  }

  await client.close();
  console.log('✅ Seed completado');
}
seed().catch(err => {
  console.error(err);
  process.exit(1);
});
*/

//Codigo solo usado para insertar los cursos(8) en la base de datos de manera estatica, y asi no se añade otro
// curso cada vez que se inicia el servidor.
// Se debe ejecutar una vez y luego comentar o eliminar este archivo para evitar duplicados.