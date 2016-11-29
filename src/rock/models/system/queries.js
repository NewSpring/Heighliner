
export default [
  `definedValues(
    id: Int!,
    limit: Int = 20,
    skip: Int = 0,
    all: Boolean = false,
  ): [DefinedValue]`,

  `notes(
    limit: Int = 20,
    skip: Int = 0,
    types: [String],
  ): [Note]`,
];
