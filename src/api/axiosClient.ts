import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://api.p2pquake.net/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
axiosClient.interceptors.request.use(
  (config) => {
    // トークン設定などの共通前処理をここに記述できます
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // エラーの共通ハンドリングをここに記述できます
    return Promise.reject(error);
  }
);

export default axiosClient;
