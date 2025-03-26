import { Types, Schema } from 'mongoose';

import * as TypeUtils from './types';

describe('Mongoose/Types', () => {
  describe('isObjectId', () => {
    it('[Mongoose/Types-0010] should return true for valid ObjectId string', () => {
      const validId = new Types.ObjectId().toString();
      expect(TypeUtils.isObjectId(validId)).toBe(true);
    });

    it('[Mongoose/Types-0020] should return false for invalid ObjectId string', () => {
      expect(TypeUtils.isObjectId('invalid-id')).toBe(false);
    });
  });

  describe('Schema type helpers', () => {
    it('[Mongoose/Types-0050] should create optional integer schema type', () => {
      const schema = TypeUtils.optionalInteger();
      expect(schema.type).toBe(Number);
      expect(typeof schema.get).toBe('function');
      expect(typeof schema.set).toBe('function');
    });

    it('[Mongoose/Types-0060] should create required integer schema type', () => {
      const schema = TypeUtils.requiredInteger();
      expect(schema.type).toBe(Number);
      expect(schema.required).toBe(true);
    });

    it('[Mongoose/Types-0070] should create optional string schema type', () => {
      const schema = TypeUtils.optionalString();
      expect(schema.type).toBe(String);
      expect(schema["required"]).toBeUndefined();
    });

    it('[Mongoose/Types-0080] should create required string schema type', () => {
      const schema = TypeUtils.requiredString();
      expect(schema.type).toBe(String);
      expect(schema.required).toBe(true);
    });

    it('[Mongoose/Types-0090] should create string with default value', () => {
      const schema = TypeUtils.toDefaultString('default');
      expect(schema.type).toBe(String);
      expect(schema.default).toBe('default');
    });

    it('[Mongoose/Types-0100] should create required string enum', () => {
      const values = ['a', 'b', 'c'];
      const schema = TypeUtils.toRequiredStringEnum(values);
      expect(schema.type).toBe(String);
      expect(schema.required).toBe(true);
      expect(schema.enum).toEqual(values);
    });

    it('[Mongoose/Types-0110] should create boolean with default false', () => {
      const schema = TypeUtils.defaultFalse();
      expect(schema.type).toBe(Boolean);
      expect(schema.default).toBe(false);
    });

    it('[Mongoose/Types-0120] should create boolean with default true', () => {
      const schema = TypeUtils.defaultTrue();
      expect(schema.type).toBe(Boolean);
      expect(schema.default).toBe(true);
    });

    it('[Mongoose/Types-0130] should create optional ObjectId reference', () => {
      const schema = TypeUtils.toOptionalObjectId('User');
      expect(schema.type).toBe(Schema.Types.ObjectId);
      expect(schema.ref).toBe('User');
      expect(schema["required"]).toBeUndefined();
    });

    it('[Mongoose/Types-0140] should create required ObjectId reference', () => {
      const schema = TypeUtils.toRequiredObjectId('User');
      expect(schema.type).toBe(Schema.Types.ObjectId);
      expect(schema.ref).toBe('User');
      expect(schema.required).toBe(true);
    });

    it('[Mongoose/Types-0150] should create mixed type with default empty object', () => {
      const schema = TypeUtils.mixed();
      expect(schema.default).toEqual({});
    });

    it('[Mongoose/Types-0160] should create mixed type with custom default', () => {
      const defaultValue = { foo: 'bar' };
      const schema = TypeUtils.toRequiredMixed(defaultValue);
      expect(schema.default).toEqual(defaultValue);
    });

    it('[Mongoose/Types-0170] should create deletedAt field with null default', () => {
      const schema = TypeUtils.deletedAt();
      expect(schema.type).toBe(Date);
      expect(schema.default).toBe(null);
    });

    it('[Mongoose/Types-0180] should create preferred date schema', () => {
      const schema = TypeUtils.preferredDate();
      expect(schema.readable.required).toBe(true);
      expect(schema.utcOffsetMinutes.required).toBe(true);
      expect(schema.year.min).toBe(1);
      expect(schema.month.min).toBe(1);
      expect(schema.dayOfMonth.min).toBe(1);
    });

    it('[Mongoose/Types-0190] should create preferred time schema', () => {
      const schema = TypeUtils.preferredTime();
      expect(schema.readable.required).toBe(true);
      expect(schema.hour.min).toBe(0);
      expect(schema.minute.min).toBe(0);
      expect(schema.totalMinutes.min).toBe(0);
    });
  });
});