import { Asset } from "./asset";
import { Part } from "./part";

export enum JobType {
  Repaired = 1,
  PM = 2,
  Decommissioned = 3
}

export interface Maintenance {
  maintenanceId: number;
  assetId: Asset["assetId"];
  partId?: Part["partId"];
  diagnosis: string;
  diagnosisDate: Date;
  jobType: JobType;
  jobStart: Date;
  jobEnd: Date;
  notes?: string;
}
