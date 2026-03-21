import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const launchParams = window.location.search || '';
  if (launchParams) {
    config.headers['x-vk-launch-params'] = launchParams;
  }
  return config;
});

export default client;
