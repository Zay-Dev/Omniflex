export type TSoftDeletable = {
  deletedAt: Date | null;
};

export type TWithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type TSnapshot = TWithTimestamps & {
  _id: string;
  enumName: string | null;

  model: string;
  modelName: string;

  lastShot: string | null;
  currentShot: Record<string, any>;

  createdBy: string | null;
};