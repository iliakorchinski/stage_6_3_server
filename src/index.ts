import express from 'express';
import cors from 'cors';
import boardRoutes from './routes/boardRoutes';
import listRoutes from './routes/listsRoutes';
import taskRoutes from './routes/tasksRoutes';
import historyRoutes from './routes/historyRoutes';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.use('/api/boards', boardRoutes);
app.use('/api', listRoutes);
app.use('/api/', taskRoutes);
app.use('/api/', historyRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
