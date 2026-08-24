import { BatteryStatus } from "./asset";
import { JobType } from "./maintenance";

export interface History {
  assetId: number;
  tagId: string;
  assetName: string;
  assetDescription: string;
  servedDate: Date;
  batteryStatus: BatteryStatus;

  maintenanceId: number;
  diagnosis: string;
  diagnosisDate: Date;
  jobType: JobType;
  jobStart: Date;
  jobEnd: Date;
  notes?: string;

  partId?: number;
  partName?: string;
  unitOfMeasure?: string;
  price?: number;

  supplierId?: number;
  supplierName?: string;
}
