import { Model, Schema, Connection, Types } from 'mongoose';

export interface IMockModel {
  updateMany?: jest.Mock;
  findOne?: jest.Mock;
  find?: jest.Mock;
  findById?: jest.Mock;
  findOneAndDelete?: jest.Mock;
  findOneAndUpdate?: jest.Mock;
  create?: jest.Mock;
  updateOne?: jest.Mock;
  deleteOne?: jest.Mock;
  deleteMany?: jest.Mock;
  exists?: jest.Mock;
  countDocuments?: jest.Mock;
  [key: string]: any;
}

export class InMemoryCollection {
  private documents: Record<string, any>[] = [];
  private schema: Schema;

  constructor(schema?: Schema) {
    this.schema = schema || new Schema({}, { timestamps: false });
  }

  insert(doc: any): any {
    const now = new Date();
    const document = {
      ...doc,
      _id: doc._id || new Types.ObjectId().toString(),
      deletedAt: null,
      ...(this.schema.get('timestamps') ? {
        createdAt: now,
        updatedAt: now
      } : {})
    };
    this.documents.push(document);
    return document;
  }

  find(query: any = {}, options: any = {}): any[] {
    return this.documents.filter(doc =>
      this._matchQuery(doc, query) &&
      this._matchParanoid(doc, options)
    );
  }

  findOne(query: any = {}, options: any = {}): any {
    const doc = this.documents.find(doc =>
      this._matchQuery(doc, query) &&
      this._matchParanoid(doc, options)
    );
    return doc || null;
  }

  findOneAndUpdate(query: any, update: any, options: any = {}): any {
    const doc = this.findOne(query, options);
    if (doc) {
      Object.assign(doc, this._processUpdate(update));
      if (this.schema.get('timestamps')) {
        doc.updatedAt = new Date();
      }
      return options?.new ? doc : { ...doc };
    }
    return null;
  }

  updateMany(query: any, update: any): { modifiedCount: number; } {
    const matches = this.documents.filter(doc => this._matchQuery(doc, query));
    matches.forEach(doc => {
      Object.assign(doc, this._processUpdate(update));
      if (this.schema.get('timestamps')) {
        doc.updatedAt = new Date();
      }
    });
    return { modifiedCount: matches.length };
  }

  updateOne(query: any, update: any): { modifiedCount: number; } {
    const doc = this.findOne(query);
    if (doc) {
      Object.assign(doc, this._processUpdate(update));
      if (this.schema.get('timestamps')) {
        doc.updatedAt = new Date();
      }
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  findOneAndDelete(query: any): any {
    const index = this.documents.findIndex(doc => this._matchQuery(doc, query));
    if (index > -1) {
      const [doc] = this.documents.splice(index, 1);
      return doc;
    }
    return null;
  }

  deleteMany(query: any): { deletedCount: number; } {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => !this._matchQuery(doc, query));
    return { deletedCount: initialLength - this.documents.length };
  }

  deleteOne(query: any): { deletedCount: number; } {
    const index = this.documents.findIndex(doc => this._matchQuery(doc, query));
    if (index > -1) {
      this.documents.splice(index, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  processUpdate(update: any): any {
    return this._processUpdate(update);
  }

  private _matchQuery(doc: any, query: any): boolean {
    return Object.entries(query).every(([key, value]) => {
      if (value instanceof Object && '$in' in value) {
        return (value as { $in: any[]; }).$in.includes(doc[key]);
      }
      if (key === '_id' && value) {
        return doc._id?.toString() === (value as any).toString();
      }
      if (value === null) {
        return doc[key] === null;
      }
      return doc[key] === value;
    });
  }

  private _matchParanoid(doc: any, options: any = {}): boolean {
    if (!options?.paranoid) return true;
    return doc.deletedAt == null;
  }

  private _processUpdate(update: any): any {
    if ('$set' in update) {
      return update.$set;
    }
    return update;
  }
}

export const createMockMongooseModel = (mockMethods: IMockModel = {}, schema?: Schema): Model<any> => {
  const collection = new InMemoryCollection(schema);

  const defaultMock = {
    updateMany: jest.fn((query, update) => Promise.resolve(collection.updateMany(query, update))),
    findOne: jest.fn((query, options) => Promise.resolve(collection.findOne(query, options))),
    find: jest.fn((query, options) => Promise.resolve(collection.find(query, options))),
    findById: jest.fn((id, options) => Promise.resolve(collection.findOne({ _id: id }, options))),
    findOneAndDelete: jest.fn(query => Promise.resolve(collection.findOneAndDelete(query))),
    findOneAndUpdate: jest.fn((query, update, options) => Promise.resolve(collection.findOneAndUpdate(query, update, options))),
    create: jest.fn(data => {
      const doc = collection.insert(data);
      return Promise.resolve({
        ...doc,
        toObject: () => doc
      });
    }),
    updateOne: jest.fn((query, update) => Promise.resolve(collection.updateOne(query, update))),
    deleteOne: jest.fn(query => Promise.resolve(collection.deleteOne(query))),
    deleteMany: jest.fn(query => Promise.resolve(collection.deleteMany(query))),
    exists: jest.fn(query => Promise.resolve(!!collection.findOne(query))),
    countDocuments: jest.fn(query => Promise.resolve(collection.find(query).length)),
    schema: schema || {
      alias: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      methods: {},
      statics: {},
      tree: {},
      paths: {},
      options: {
        noAliasId: false
      }
    },
    model: {
      schema: {
        recompileSchema: jest.fn(),
      },
    },
    recompileSchema: jest.fn(),
    base: {
      models: {},
    },
    db: {
      models: {},
    },
    collection: {
      name: 'mock_collection',
    },
    modelName: 'MockModel',
    ...mockMethods,
  };

  return defaultMock as unknown as Model<any>;
};

export const createMockConnection = (): Partial<Connection> => ({
  model: jest.fn(),
  models: {},
});

export const createMockObjectId = () => new Types.ObjectId().toString();