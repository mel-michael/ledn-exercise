import axios from 'axios';

export const lednApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    common: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }
});
