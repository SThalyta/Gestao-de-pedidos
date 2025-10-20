const express = require('express');
const authRoutes = require('./routes/authRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const cardapioRoutes = require('./routes/cardapioRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/sistema', pedidoRoutes);
app.use('/sistema', cardapioRoutes);
app.use('/sistema', pagamentoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});