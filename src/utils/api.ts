import axios from 'axios';

console.log('REACT_APP_API_URL', process.env.REACT_APP_API_URL)

export const lednApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    common: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }
});
