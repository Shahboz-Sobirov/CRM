import api from './client'

// ---- Auth ----
export const authApi = {
  login: (phone, password) => api.post('/auth/login/', { phone, password }),
  register: (payload) => api.post('/auth/register/', payload),
  me: () => api.get('/auth/me/'),
  changePassword: (payload) => api.post('/auth/change-password/', payload),
  listUsers: () => api.get('/auth/users/'),
  createUser: (payload) => api.post('/auth/users/', payload),
  updateUser: (id, payload) => api.patch(`/auth/users/${id}/`, payload),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`),
}

// ---- Students ----
export const studentsApi = {
  list: (params) => api.get('/students/', { params }),
  get: (id) => api.get(`/students/${id}/`),
  create: (payload) => api.post('/students/', payload),
  update: (id, payload) => api.patch(`/students/${id}/`, payload),
  remove: (id) => api.delete(`/students/${id}/`),
  attendance: (id) => api.get(`/students/${id}/attendance/`),
  payments: (id) => api.get(`/students/${id}/payments/`),
}

// ---- Teachers ----
export const teachersApi = {
  list: (params) => api.get('/teachers/', { params }),
  get: (id) => api.get(`/teachers/${id}/`),
  create: (payload) => api.post('/teachers/', payload),
  update: (id, payload) => api.patch(`/teachers/${id}/`, payload),
  remove: (id) => api.delete(`/teachers/${id}/`),
}

// ---- Groups / Classes ----
export const groupsApi = {
  list: (params) => api.get('/classes/', { params }),
  get: (id) => api.get(`/classes/${id}/`),
  create: (payload) => api.post('/classes/', payload),
  update: (id, payload) => api.patch(`/classes/${id}/`, payload),
  remove: (id) => api.delete(`/classes/${id}/`),
  students: (id) => api.get(`/classes/${id}/students/`),
  addStudent: (id, studentId) => api.post(`/classes/${id}/students/`, { student_id: studentId }),
}

// ---- Attendance ----
export const attendanceApi = {
  list: (params) => api.get('/attendance/', { params }),
  get: (id) => api.get(`/attendance/${id}/`),
  create: (payload) => api.post('/attendance/', payload),
  update: (id, payload) => api.patch(`/attendance/${id}/`, payload),
  remove: (id) => api.delete(`/attendance/${id}/`),
  bulkMark: (payload) => api.post('/attendance/mark/', payload),
}

// ---- Payments ----
export const paymentsApi = {
  list: (params) => api.get('/payments/', { params }),
  get: (id) => api.get(`/payments/${id}/`),
  create: (payload) => api.post('/payments/', payload),
  update: (id, payload) => api.patch(`/payments/${id}/`, payload),
  remove: (id) => api.delete(`/payments/${id}/`),
  statistics: () => api.get('/payments/statistics/'),
  approve: (id) => api.post(`/payments/${id}/approve/`),
  reject: (id) => api.post(`/payments/${id}/reject/`),
}
