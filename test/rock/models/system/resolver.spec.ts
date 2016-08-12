import test from "ava";
import Resolver from "../../../../src/rock/models/system/resolver";
import casual from "casual";
import { createGlobalId } from "../../../../src/util/node/model";

const sampleData = {
  Id: `${casual.integer(0, 1000)}`,
  Value: casual.word,
  Description: casual.word,
};

// Query: {
//     definedValues: (_, { limit, id, skip, all } , { models }) => {
//       let query = { offset: skip } as any;
//       if (!all) query.limit = limit;

//       return models.Rock.getDefinedValuesByTypeId(id, query);
//     },
//   },

//   DefinedValue: {
//     id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
//     _id: ({ Id }) => Id,
//     value: ({ Value }) => Value,
//     description: ({ Description }) => Description,
//   },

function macro(t, resolver, expected) {
  const { DefinedValue } = Resolver;
  t.is(DefinedValue[resolver](sampleData), sampleData[expected]);
}

test("Query should return `definedValues` as an option", t => {
  const { definedValues } = Resolver.Query;
  const offset = 1;
  const limit = 1;
  const models = {
    Rock: {
      getDefinedValuesByTypeId(id, query) {
        t.is(id, sampleData.Id);
        t.deepEqual(query, { offset, limit });
        return true;
      },
    },
  };

  t.truthy(definedValues(null, { limit, id: sampleData.Id, skip: offset, all: false }, { models }));
});

test("`DefinedValue` should return a global id", t => {
  const { DefinedValue } = Resolver;
  t.is(
    DefinedValue.id(sampleData, null, null, { parentType: { name: "DefinedValue" } }),
    createGlobalId(sampleData.Id, "DefinedValue")
  );
});

(test as any)("_id should return the entity id", macro, "_id", "Id");
(test as any)("value should resolve from Value", macro, "value", "Value");
(test as any)("description should resolve from Description", macro, "description", "Description");
