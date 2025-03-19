export type TSoftDeletable = {
  deletedAt: Date | null;
};

export type TWithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};