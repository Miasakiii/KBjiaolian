import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
