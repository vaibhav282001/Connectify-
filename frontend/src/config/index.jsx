const {default: axios} = require('axios');

export const BASE_URL = "https://connectify-shzs.onrender.com/"

export const clientServer = axios.create({
  baseURL: BASE_URL
});