import api from "./axios";

export const getDashboardStatistics = () => {
  return api.get("/dashboard/statistics");
};
