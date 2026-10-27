import api from "./api";

const RESOURCE = "/agenda";

const getAgenda = () => api.get(RESOURCE);
const addToAgenda = (sessionId) => api.post(`${RESOURCE}/${sessionId}`);
const removeFromAgenda = (sessionId) => api.delete(`${RESOURCE}/${sessionId}`);

const agendaService = { getAgenda, addToAgenda, removeFromAgenda };

export default agendaService;