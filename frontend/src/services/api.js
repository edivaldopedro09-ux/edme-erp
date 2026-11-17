import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercetor para injetar o Token JWT e o ID da Empresa ativa em cada pedido
api.interceptors.request.use(
  (config) => {
    try {
      // Injetar Token de Autenticação
      const token = localStorage.getItem('edme_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Injetar o ID da Empresa Ativa (Header exigido pelo backend multi-tenant)
      const companyId = localStorage.getItem('edme_active_company');
      if (companyId) {
        config.headers['x-company-id'] = companyId;
      }
    } catch (e) {
      console.error('Erro ao ler dados do localStorage no api.js:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercetor para tratar erros de resposta de forma segura
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`Erro na API [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('Erro de Conexão: O servidor backend não está a responder.');
    }
    return Promise.reject(error);
  }
);

export default api;