require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require("./routes/testRoutes");
const workoutRoutes = require('./routes/workoutRoutes');
const goalRoutes = require('./routes/goalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/', routes);
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
