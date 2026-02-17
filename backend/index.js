const express = require('express');
const sequelize = require('./config/database');
const app = express();
app.use(express.json());
const UserRouter = require('./routes/users');
const LoginRouter = require('./routes/login');








sequelize.sync().then(() => {
  console.log('Database synchronized');
})
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });





app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});


//user routes
app.use('/users', UserRouter);
const LLMRouter = require('./routes/LLM');
app.use('/api/llm', LLMRouter);



//login routes
app.use('/login', LoginRouter);

















app.listen(6000, () => {
  console.log('Server is running on port 6000');
});