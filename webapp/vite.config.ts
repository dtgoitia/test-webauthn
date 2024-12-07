import react from '@vitejs/plugin-react';
import fs from 'fs';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync("../certbot/config/live/beltz.dtgoitia.dev/privkey.pem"),
      cert: fs.readFileSync("../certbot/config/live/beltz.dtgoitia.dev/fullchain.pem"),
    }
  }
})
