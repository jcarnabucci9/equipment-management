export enum BatteryStatus {
  Good = 90,
  Half = 20,
  Replacement = 0,
  Dead = -1
}

export interface Asset {
  assetId: number;
  tagId?: string;
  serialNumber?: number;
  assetName: string;
  assetDescription: string;
  servedDate: Date;
  batteryStatus: BatteryStatus;
}
