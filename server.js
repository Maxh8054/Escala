require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Conectado!'))
  .catch(err => console.error('Erro ao conectar MongoDB:', err));

// Definição do Modelo (Tabela)
// Vamos salvar tudo em um único documento identificado pelo ID "configuracao_geral"
const dadosSchema = new mongoose.Schema({
  _id: String, // Forçamos o ID para ser "lundin_data"
  atestados: Object,
  spots: Object,
  adms: Object,
  eventos: Object
}, { _id: false });

const Dados = mongoose.model('Dados', dadosSchema);

// ROTA PARA PEGAR OS DADOS (GET)
app.get('/api/dados', async (req, res) => {
  try {
    // Tenta buscar o documento. Se não existir, cria um vazio.
    let dados = await Dados.findById('lundin_data');
    if (!dados) {
      dados = new Dados({ 
        _id: 'lundin_data',
        atestados: { A:[], B:[], C:[], D:[] },
        spots: { A:[], B:[], C:[], D:[] },
        adms: { A:[], B:[], C:[], D:[] },
        eventos: { A:[], B:[], C:[], D:[] }
      });
      await dados.save();
    }
    res.json(dados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

// ROTA PARA SALVAR OS DADOS (POST)
app.post('/api/dados', async (req, res) => {
  try {
    const { atestados, spots, adms, eventos } = req.body;

    // Atualiza o documento existente
    await Dados.findByIdAndUpdate('lundin_data', {
      atestados,
      spots,
      adms,
      eventos
    }, { upsert: true, new: true });

    res.json({ mensagem: 'Dados salvos com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao salvar dados' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 