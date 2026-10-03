import axios from 'axios';
import {API_BASE} from '../constant/Constant'

export const api = {
  // Categories
  getCategories: () => axios.get(`${API_BASE}/categories`).then(res => res.data),
  createCategory: (data) => axios.post(`${API_BASE}/categories`, data).then(res => res.data),
  updateCategory: (id, updates) => axios.put(`${API_BASE}/categories/${id}`, updates).then(res => res.data),
  deleteCategory: (id) => axios.delete(`${API_BASE}/categories/${id}`).then(res => res.data),

  // Subcategories
  addSubcategory: (categoryId, sub) => axios.post(`${API_BASE}/categories/${categoryId}/subcategories`, sub).then(res => res.data),
  updateSubcategory: (categoryId, subId, updates) => axios.put(`${API_BASE}/categories/${categoryId}/subcategories/${subId}`, updates).then(res => res.data),
  deleteSubcategory: (categoryId, subId) => axios.delete(`${API_BASE}/categories/${categoryId}/subcategories/${subId}`).then(res => res.data)
};
