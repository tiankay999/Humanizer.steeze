const express= require('express');
const app = express();






app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});





















app.listen(6000, () => {
  console.log('Server is running on port 6000');
}   );