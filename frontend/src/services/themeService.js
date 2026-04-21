import api from './api'
export const getThemes      = ()       => api.get('/api/themes')
export const createTheme    = (data)   => api.post('/api/themes', data)
export const updateTheme    = (id, d)  => api.put(`/api/themes/${id}`, d)
export const deleteTheme    = (id)    => api.delete(`/api/themes/${id}`)
export const activateTheme  = (id)    => api.put(`/api/themes/${id}/activate`)