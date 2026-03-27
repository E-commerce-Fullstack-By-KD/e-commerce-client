import { get, post, patch, del } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, Collection } from "@/types";

interface CollectionListResult {
  collection: Collection[];
}

interface CollectionDetailResult {
  collection: Collection;
}

export const collectionService = {
  getAll() {
    return get<ApiResponse<CollectionListResult>>(API_ENDPOINTS.ADMIN.COLLECTION.LIST);
  },

  getById(id: number | string) {
    return get<ApiResponse<CollectionDetailResult>>(API_ENDPOINTS.ADMIN.COLLECTION.DETAIL(id));
  },

  create(name: string) {
    return post<ApiResponse>(API_ENDPOINTS.ADMIN.COLLECTION.CREATE, { name });
  },

  update(id: number, name: string) {
    return patch<ApiResponse>(API_ENDPOINTS.ADMIN.COLLECTION.UPDATE, { id, name });
  },

  remove(id: number | string) {
    return del<ApiResponse>(API_ENDPOINTS.ADMIN.COLLECTION.DELETE(id));
  },
};
