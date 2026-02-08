const express= require('express');
const sequelize = require('./config/database');
const app = express();

sequelize.sync().then(() => {
  console.log('Database synchronized');
})
.catch((error) => {
  console.error('Error synchronizing database:', error);
});





app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});





















app.listen(6000, () => {
  console.log('Server is running on port 6000');
}   );