import { pick } from "lodash";
import { DefinedValueSearch, DefinedValue, definedValueKeys } from "./model";

// XXX there are currently 97 of class types we need to model
export default {
  ["Rock.Field.Types.TextFieldType"]: (value: DefinedValueSearch): DefinedValue => {
    // textfields are just string represetations. so lets just return the defined type
    return pick(value, definedValueKeys) as DefinedValue;
  },
};
