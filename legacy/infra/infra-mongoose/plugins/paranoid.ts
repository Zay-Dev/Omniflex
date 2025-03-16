import { Schema } from 'mongoose';

export const paranoidPlugin = (schema: Schema) => {
  schema.add({
    deletedAt: { type: Date, default: null },
  });

  schema.methods.restore = async function () {
    this.deletedAt = null;
    return this.save();
  };

  const queryHelper = function (this: any, next: any) {
    if (this.options?.paranoid !== false) {
      this.where({ deletedAt: null });
    }

    return next();
  };

  schema.pre(/^find/, queryHelper);
  schema.pre(/^count/, queryHelper);
  schema.pre(/^update/, queryHelper);
};