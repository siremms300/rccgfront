import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Teaching APIs
export const teachingAPI = {
  getAll: (params?: any) => api.get('/teachings', { params }),
  getOne: (id: string) => api.get(`/teachings/${id}`),
  create: (data: any) => api.post('/teachings', data),
  update: (id: string, data: any) => api.put(`/teachings/${id}`, data),
  delete: (id: string) => api.delete(`/teachings/${id}`),
  incrementDownload: (id: string) => api.post(`/teachings/${id}/download`),
};

// Event APIs
export const eventAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  getOne: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  register: (id: string) => api.post(`/events/${id}/register`),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getOne: (id: string) => api.get(`/departments/${id}`),
  create: (data: any) => api.post('/departments', data),
  update: (id: string, data: any) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
  addMember: (id: string, userId: string) => api.post(`/departments/${id}/members`, { userId }),
  removeMember: (id: string, userId: string) => api.delete(`/departments/${id}/members/${userId}`),
};

// Gallery APIs
export const galleryAPI = {
  getAll: (params?: any) => api.get('/gallery', { params }),
  getOne: (id: string) => api.get(`/gallery/${id}`),
  create: (data: any) => api.post('/gallery', data),
  update: (id: string, data: any) => api.put(`/gallery/${id}`, data),
  delete: (id: string) => api.delete(`/gallery/${id}`),
};

// Group APIs
export const groupAPI = {
  getAll: () => api.get('/groups'),
  getOne: (id: string) => api.get(`/groups/${id}`),
  create: (data: any) => api.post('/groups', data),
  update: (id: string, data: any) => api.put(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  join: (id: string) => api.post(`/groups/${id}/join`),
  leave: (id: string) => api.post(`/groups/${id}/leave`),
};

// Prayer APIs
export const prayerAPI = {
  getAll: (params?: any) => api.get('/prayers', { params }),
  getOne: (id: string) => api.get(`/prayers/${id}`),
  create: (data: any) => api.post('/prayers', data),
  update: (id: string, data: any) => api.put(`/prayers/${id}`, data),
  delete: (id: string) => api.delete(`/prayers/${id}`),
};

// User APIs
export const userAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
};

// Upload APIs
export const uploadAPI = {
  uploadSingle: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultiple: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;




































































// import axios from 'axios';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add token to requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       if (typeof window !== 'undefined') {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// // Auth APIs
// export const authAPI = {
//   login: (email: string, password: string) => api.post('/auth/login', { email, password }),
//   register: (userData: any) => api.post('/auth/register', userData),
//   getMe: () => api.get('/auth/me'),
// };

// // Teaching APIs
// export const teachingAPI = {
//   getAll: (params?: any) => api.get('/teachings', { params }),
//   getOne: (id: string) => api.get(`/teachings/${id}`),
//   create: (data: any) => api.post('/teachings', data),
//   update: (id: string, data: any) => api.put(`/teachings/${id}`, data),
//   delete: (id: string) => api.delete(`/teachings/${id}`),
//   incrementDownload: (id: string) => api.post(`/teachings/${id}/download`),
// };

// // Event APIs
// export const eventAPI = {
//   getAll: (params?: any) => api.get('/events', { params }),
//   getOne: (id: string) => api.get(`/events/${id}`),
//   create: (data: any) => api.post('/events', data),
//   update: (id: string, data: any) => api.put(`/events/${id}`, data),
//   delete: (id: string) => api.delete(`/events/${id}`),
//   register: (id: string) => api.post(`/events/${id}/register`),
// };

// // Department APIs
// export const departmentAPI = {
//   getAll: () => api.get('/departments'),
//   getOne: (id: string) => api.get(`/departments/${id}`),
//   create: (data: any) => api.post('/departments', data),
//   update: (id: string, data: any) => api.put(`/departments/${id}`, data),
//   delete: (id: string) => api.delete(`/departments/${id}`),
// };

// // Gallery APIs
// export const galleryAPI = {
//   getAll: (params?: any) => api.get('/gallery', { params }),
//   getOne: (id: string) => api.get(`/gallery/${id}`),
//   create: (data: any) => api.post('/gallery', data),
//   update: (id: string, data: any) => api.put(`/gallery/${id}`, data),
//   delete: (id: string) => api.delete(`/gallery/${id}`),
// };

// // Group APIs
// export const groupAPI = {
//   getAll: () => api.get('/groups'),
//   getOne: (id: string) => api.get(`/groups/${id}`),
//   create: (data: any) => api.post('/groups', data),
//   update: (id: string, data: any) => api.put(`/groups/${id}`, data),
//   delete: (id: string) => api.delete(`/groups/${id}`),
// };

// // Prayer APIs
// export const prayerAPI = {
//   getAll: () => api.get('/prayers'),
//   getOne: (id: string) => api.get(`/prayers/${id}`),
//   create: (data: any) => api.post('/prayers', data),
//   update: (id: string, data: any) => api.put(`/prayers/${id}`, data),
//   delete: (id: string) => api.delete(`/prayers/${id}`),
// };

// // Upload APIs
// export const uploadAPI = {
//   uploadSingle: (file: File, folder?: string) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     if (folder) formData.append('folder', folder);
//     return api.post('/upload/single', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   },
//   uploadMultiple: (files: File[], folder?: string) => {
//     const formData = new FormData();
//     files.forEach((file) => formData.append('files', file));
//     if (folder) formData.append('folder', folder);
//     return api.post('/upload/multiple', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   },
// };

// export default api;