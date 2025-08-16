import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Trello Clone API');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
