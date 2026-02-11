require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); // Biblioteca para Postgres
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Inicialização do Banco
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS escala_data (
        id SERIAL PRIMARY KEY,
        dados JSONB NOT NULL
      );
    `);
    
    const res = await pool.query('SELECT * FROM escala_data WHERE id = 1');
    if (res.rows.length === 0) {
      const initialData = {
        atestados: { A: [], B: [], C: [], D: [] },
        spots: { A: [], B: [], C: [], D: [] },
        adms: { A: [], B: [], C: [], D: [] },
        eventos: { A: [], B: [], C: [], D: [] }
      };
      await pool.query('INSERT INTO escala_data (id, dados) VALUES ($1, $2)', [1, initialData]);
      console.log('Banco inicializado.');
    }
  } catch (err) {
    console.error('Erro no DB:', err);
  }
};

initDb();

// ROTA GET
app.get('/api/dados', async (req, res) => {
  try {
    const result = await pool.query('SELECT dados FROM escala_data WHERE id = 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0].dados);
    } else {
      res.json({ atestados: {}, spots: {}, adms: {}, eventos: {} });
    }
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar' });
  }
});

// ROTA POST
app.post('/api/dados', async (req, res) => {
  try {
    const { atestados, spots, adms, eventos } = req.body;
    const dados = { atestados, spots, adms, eventos };
    await pool.query('UPDATE escala_data SET dados = $1 WHERE id = 1', [dados]);
    res.json({ mensagem: 'Salvo!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao salvar' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
