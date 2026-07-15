import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserByEmail: (email) => api.get('/users/email', { params: { email } }),
  searchUsers: (searchRequest = {}, params = {}) => api.post('/users/search', searchRequest, { params }),
  getUserStatistics: (id) => api.get(`/users/${id}/statistics`),
};

export const projectService = {
  getProjects: (searchRequest = {}, params = {}) => api.post('/projects/search', searchRequest, { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  getProjectByKey: (key) => api.get(`/projects/key/${key}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  archiveProject: (id) => api.post(`/projects/${id}/archive`),
  restoreProject: (id) => api.post(`/projects/${id}/restore`),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getProjectStatistics: (id) => api.get(`/projects/${id}/statistics`),

  // Member Management
  inviteMember: (projectId, data) => api.post(`/projects/${projectId}/members/invite`, data),
  getMembers: (projectId, params = {}) => api.get(`/projects/${projectId}/members`, { params }),
  getMemberDetails: (projectId, memberId) => api.get(`/projects/${projectId}/members/${memberId}`),
  updateMemberRole: (projectId, memberId, role) => api.put(`/projects/${projectId}/members/${memberId}/role`, { role }),
  transferOwnership: (projectId, targetMemberId) => api.post(`/projects/${projectId}/members/${targetMemberId}/transfer-ownership`),
  removeMember: (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}`),
  leaveProject: (projectId) => api.post(`/projects/${projectId}/members/leave`),

  // Invitations
  getInvitations: () => api.get('/projects/invitations/me'),
  acceptInvitation: (id) => api.post(`/projects/invitations/${id}/accept`),
  rejectInvitation: (id) => api.post(`/projects/invitations/${id}/reject`),
};

export const taskService = {
  getTasks: (searchRequest = {}, params = {}) => api.post('/tasks/search', searchRequest, { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignUser: (id, userId) => api.put(`/tasks/${id}/assign`, null, { params: { userId } }),
  getTaskStatistics: (projectId, assigneeId) => api.get('/tasks/statistics', { params: { projectId, assigneeId } }),
};

export const commentService = {
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  searchComments: (searchRequest = {}, params = {}) => api.post('/comments/search', searchRequest, { params }),
  getCommentHistory: (id) => api.get(`/comments/${id}/history`),
};

export const notificationService = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const reportService = {
  getProjectReport: (projectId) => api.get(`/reports/projects/${projectId}`),
  getUserReport: (userId) => api.get(`/reports/users/${userId}`),
  getTaskReport: (projectId) => api.get(`/reports/tasks/${projectId}`),
  getWeeklyReport: (projectId) => api.get(`/reports/projects/${projectId}/weekly`),
  getMonthlyReport: (projectId) => api.get(`/reports/projects/${projectId}/monthly`),
};

export const activityService = {
  searchActivities: (searchRequest = {}, params = {}) => api.post('/activities/search', searchRequest, { params }),
  getProjectTimeline: (projectId, params = {}) => api.get(`/activities/projects/${projectId}`, { params }),
  getUserTimeline: (userId, params = {}) => api.get(`/activities/users/${userId}`, { params }),
  getRecentActivities: (params = {}) => api.get('/activities/recent', { params }),
};

export const searchService = {
  globalSearch: (query) => api.get('/search', { params: { query } }),
};

export const calendarService = {
  getTodayTasks: () => api.get('/calendar/today'),
  getWeeklyTasks: () => api.get('/calendar/weekly'),
  getMonthlyTasks: () => api.get('/calendar/monthly'),
  getUpcomingDeadlines: () => api.get('/calendar/deadlines'),
};

export const attachmentService = {
  uploadAttachment: (formData) => api.post('/attachments/upload', formData, {
    headers: { 'Content-Type': undefined },
  }),
  downloadAttachmentFile: (id) => api.get(`/attachments/${id}/download`, { responseType: 'blob' }),
  getAttachmentMetadata: (id) => api.get(`/attachments/${id}`),
  deleteAttachment: (id) => api.delete(`/attachments/${id}`),
  getAttachmentsByTask: (taskId) => api.get(`/attachments/task/${taskId}`),
  getAttachmentsByProject: (projectId) => api.get(`/attachments/project/${projectId}`),
};

export const aiService = {
  chat: (message, projectId = null) => api.post('/ai/chat', { message, projectId }),
  generateProject: (prompt) => api.post('/ai/project/generate', { prompt }),
  planSprint: (projectId, sprintGoal = '') => api.post('/ai/sprint/plan', { projectId, sprintGoal }),
  analyzeRisks: (projectId) => api.post('/ai/risk/analyze', { projectId }),
  generateDocumentation: (projectId, docType = 'README') => api.post('/ai/documentation', { projectId, docType }),
};
