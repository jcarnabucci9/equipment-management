import { Asset, BatteryStatus } from "@/interfaces/asset";
import { History } from "@/interfaces/history";
import { JobType, Maintenance } from "@/interfaces/maintenance";
import { Part } from "@/interfaces/part";
import { Supplier } from "@/interfaces/supplier";

const API_BASE_URL =
  process.env.API_URL ||
  "https://equipment-management-api-cfa0ayhefmh3gjdx.canadaeast-01.azurewebsites.net/api";

export interface CreateAssetDto {
  tagId?: string;
  serialNumber?: number;
  assetName: string;
  assetDescription: string;
  servedDate: string;
  batteryStatus: BatteryStatus;
}

export interface UpdateAssetDto {
  tagId?: string;
  serialNumber?: number;
  assetName?: string;
  assetDescription?: string;
  servedDate?: string;
  batteryStatus?: BatteryStatus;
}

export interface CreateMaintenanceDto {
  assetId: number;
  partId?: number;
  diagnosis: string;
  diagnosisDate: string;
  jobType: JobType;
  jobStart: string;
  jobEnd: string;
  notes?: string;
}

export interface UpdateMaintenanceDto {
  assetId?: number;
  partId?: number;
  diagnosis?: string;
  diagnosisDate?: string;
  jobType?: JobType;
  jobStart?: string;
  jobEnd?: string;
  notes?: string;
}

export interface CreatePartDto {
  partName: string;
  unitOfMeasure: string;
  price: number;
}

export interface UpdatePartDto {
  partName?: string;
  unitOfMeasure?: string;
  price?: number;
}

export interface CreateSupplierDto {
  supplierName: string;
}

export interface UpdateSupplierDto {
  supplierName?: string;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: { ...defaultHeaders, ...options.headers },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.errors?.[0] ?? error.message ?? `API Error: ${response.status}`);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  const json = await response.json();
  return (json?.data !== undefined ? json.data : json) as T;
}

export const assetApi = {
  getAll: () => apiFetch<Asset[]>("/asset", { method: "GET" }),
  getById: (id: number) => apiFetch<Asset>(`/asset/${id}`, { method: "GET" }),
  getByTagId: (tagId: string) =>
    apiFetch<Asset>(`/asset/tag/${tagId}`, { method: "GET" }),
  getByBatteryStatus: (status: BatteryStatus) =>
    apiFetch<Asset[]>(`/asset/battery/${status}`, { method: "GET" }),
  getTotalCount: () =>
    apiFetch<{ count: number }>("/asset/stats/total", { method: "GET" }),
  create: (data: CreateAssetDto) =>
    apiFetch<Asset>("/asset", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: UpdateAssetDto) =>
    apiFetch<Asset>(`/asset/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => apiFetch<void>(`/asset/${id}`, { method: "DELETE" }),
};

export const maintenanceApi = {
  getAll: () => apiFetch<Maintenance[]>("/maintenance", { method: "GET" }),
  getById: (id: number) =>
    apiFetch<Maintenance>(`/maintenance/${id}`, { method: "GET" }),
  getByAssetId: (assetId: number) =>
    apiFetch<Maintenance[]>(`/maintenance/asset/${assetId}`, { method: "GET" }),
  getByJobType: (jobType: JobType) =>
    apiFetch<Maintenance[]>(`/maintenance/job-type/${jobType}`, {
      method: "GET",
    }),
  create: (data: CreateMaintenanceDto) =>
    apiFetch<Maintenance>("/maintenance", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateMaintenanceDto) =>
    apiFetch<Maintenance>(`/maintenance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/maintenance/${id}`, { method: "DELETE" }),
};

export const historyApi = {
  getAll: () => apiFetch<History[]>("/history", { method: "GET" }),
  getByAssetId: (assetId: number) =>
    apiFetch<History[]>(`/history/asset/${assetId}`, { method: "GET" }),
  getByDateRange: (start: string, end: string) =>
    apiFetch<History[]>(`/history/date-range?start=${start}&end=${end}`, {
      method: "GET",
    }),
};

export const partApi = {
  getAll: () => apiFetch<Part[]>("/part", { method: "GET" }),
  getById: (id: number) => apiFetch<Part>(`/part/${id}`, { method: "GET" }),
  create: (data: CreatePartDto) =>
    apiFetch<Part>("/part", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: UpdatePartDto) =>
    apiFetch<Part>(`/part/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => apiFetch<void>(`/part/${id}`, { method: "DELETE" }),
};

export const supplierApi = {
  getAll: () => apiFetch<Supplier[]>("/supplier", { method: "GET" }),
  getById: (id: number) =>
    apiFetch<Supplier>(`/supplier/${id}`, { method: "GET" }),
  create: (data: CreateSupplierDto) =>
    apiFetch<Supplier>("/supplier", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateSupplierDto) =>
    apiFetch<Supplier>(`/supplier/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/supplier/${id}`, { method: "DELETE" }),
};
