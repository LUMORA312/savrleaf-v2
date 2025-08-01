require('dotenv').config();
require('./models/Application');
require('./models/Deal');
require('./models/Dispensary');
require('./models/Subscription');
require('./models/SubscriptionTier');
require('./models/User');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));

app.get('/', (req, res) => res.send('Backend is running'));
