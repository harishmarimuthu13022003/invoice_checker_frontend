import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://invoice-mapper.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Role': 'Administrator' // Default role for demo, should be managed by auth
  }
});

export const invoiceApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/invoices/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getInvoices: (gender?: string) => {
    return api.get('/invoices', {
      params: { gender }
    });
  },
  
  getInvoice: (invoiceId: string) => {
    return api.get(`/invoices/${invoiceId}`);
  },
  
  updateLineItem: (invoiceId: string, itemIndex: number, finalCode: string, notes?: string) => {
    return api.put(`/invoices/${invoiceId}/line-items/${itemIndex}`, {
      final_code: finalCode,
      notes
    });
  },
  
  approveInvoice: (invoiceId: string) => {
    return api.post(`/invoices/${invoiceId}/approve`, {});
  },
  
  getServiceCodes: (category?: string) => {
    return api.get('/service-codes', {
      params: { category }
    });
  },
  
  getAuditLogs: (invoiceId?: string) => {
    return api.get('/audit-logs', {
      params: { invoice_id: invoiceId }
    });
  },
  
  getRagStats: () => {
    return api.get('/rag/stats');
  },
  
  getCategoryRequests: (status?: string) => {
    return api.get('/category-requests', {
      params: { status }
    });
  },
  
  approveCategoryRequest: (requestId: string) => {
    return api.put(`/category-requests/${requestId}/approve`, {});
  }
};

export default api;
