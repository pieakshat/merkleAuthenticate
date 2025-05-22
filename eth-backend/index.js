import 'dotenv/config';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { anchorDocument } from './handlers/anchor.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// example route
app.get('/', (_req, res) => res.send('OK'));

app.post('/anchor', anchorDocument)


const PORT = process.env.PORT || 8081;
app.listen(8081, () => console.log(`Server listening on ${PORT}`));
