require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/push', require('./routes/push').router);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'BookSlot API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🗓  BookSlot API running on http://localhost:${PORT}`));
