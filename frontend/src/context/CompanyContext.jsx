import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchCompanies = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);

      // Leitura segura do localStorage com tratamento de erro
      let savedId = null;
      try {
        savedId = localStorage.getItem('edme_active_company');
      } catch (e) {
        localStorage.removeItem('edme_active_company');
      }

      const found = data.find((c) => c._id === savedId) || data[0] || null;
      if (found) {
        setActiveCompany(found);
        try {
          localStorage.setItem('edme_active_company', found._id);
        } catch (e) {}
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  }, [user]);

  const fetchProducts = useCallback(async (forceLoader = false) => {
    if (!activeCompany) {
      setProducts([]);
      return;
    }
    if (forceLoader) setLoadingProducts(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [activeCompany]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (activeCompany) {
      fetchProducts(products.length === 0);
    }
  }, [activeCompany, fetchProducts]);

  const selectCompany = (company) => {
    setProducts([]);
    setActiveCompany(company);
    try {
      localStorage.setItem('edme_active_company', company._id);
    } catch (e) {}
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        selectCompany,
        fetchCompanies,
        products,
        loadingProducts,
        fetchProducts,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);