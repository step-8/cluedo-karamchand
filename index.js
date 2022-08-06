const { createApp } = require('./src/app.js');
require('dotenv').config();

const main = () => {
  const app = createApp();
  const PORT = process.env.PORT;

  app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
};

main();
