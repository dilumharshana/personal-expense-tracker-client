// src/services/masterDataService.ts
import { apiClient } from "../Utilis/ApiClient";
import { API_ENDPOINTS } from "../Configs/Api";
import type { MasterData } from "../Types/Index";

export const masterDataService = {
  getMasterData: async (): Promise<MasterData[]> => {
    return await apiClient.get<MasterData[]>(API_ENDPOINTS.MASTER_DATA);
  },

  createMasterData: async (data: { title: string }): Promise<MasterData> => {
    return await apiClient.post<MasterData>(API_ENDPOINTS.MASTER_DATA, data);
  },

  updateMasterData: async (
    id: string,
    data: { title: string },
  ): Promise<MasterData> => {
    return await apiClient.patch<MasterData>(
      `${API_ENDPOINTS.MASTER_DATA}/${id}`,
      data,
    );
  },

  deleteMasterData: async (id: string): Promise<void> => {
    return await apiClient.delete<void>(`${API_ENDPOINTS.MASTER_DATA}/${id}`);
  },
};
