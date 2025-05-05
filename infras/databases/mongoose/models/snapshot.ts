import type mongoose from 'mongoose';
import type { TSnapshot } from '@omni-infra/types/entities';

import { Schema } from 'mongoose';
import * as Types from '../types';

export type TDbSnapshot = TSnapshot & {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId | null;

  model: mongoose.Types.ObjectId;
  lastShot: mongoose.Types.ObjectId | null;
};

export const getSchema = (userModelName: string) => {
  const schema = new Schema<TDbSnapshot>(
    {
      enumName: Types.optionalString(),
      createdBy: Types.toOptionalObjectId(userModelName),

      modelName: Types.requiredString(),
      model: Types.toRequiredRefPathObjectId('modelName'),

      currentShot: Types.toRequiredMixed(),
      lastShot: Types.toOptionalRefPathObjectId('modelName'),
    },
    { timestamps: true },
  );

  schema.index({ createdBy: 1 });
  schema.index({ createdAt: -1 });
  schema.index({ updatedAt: -1 });

  schema.index({ enumName: 1 });
  schema.index({ modelName: 1 });
  schema.index({ currentModel: -1 });
  schema.index({ lastSnapshot: -1 });

  return schema;
};