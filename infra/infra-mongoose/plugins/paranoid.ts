import { Schema } from 'mongoose';

export const paranoidPlugin = (schema: Schema) => {
  schema.add({
    deletedAt: { type: Date, default: null },
  });

  schema.methods.restore = async function() {
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.restore = async function(filter) {
    return this.updateMany(filter, { deletedAt: null });
  };

  const queryHelper = function(this: any) {
    if (this.options?.paranoid !== false) {
      this.where({ deletedAt: null });
    }
    return this;
  };

  schema.pre(/^find/, queryHelper);
  schema.pre(/^count/, queryHelper);
  schema.pre(/^update/, queryHelper);
}; 