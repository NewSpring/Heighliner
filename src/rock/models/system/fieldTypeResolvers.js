// import { pick } from "lodash";
import moment from "moment";

function castToBoolean(val) {
  if (val.toLowerCase() === "true") return true;
  return false;
}

// XXX there are currently 97 of class types we need to model
export default {
  "Rock.Field.Types.TextFieldType": function(value, defaultValue) {
    if (!value && defaultValue) return defaultValue;
    return value;
  },
  "Rock.Field.Types.DateFieldType": function(value, defaultValue) {
    if (!value && defaultValue) return defaultValue;
    return moment(value).toString();
  },
  "Rock.Field.Types.SelectSingleFieldType": function(value, defaultValue) {
    if (!value && defaultValue) return defaultValue;
    return value;
  },
  "Rock.Field.Types.BooleanFieldType": function(value, defaultValue) {
    if (!value && defaultValue) return castToBoolean(defaultValue);
    return castToBoolean(value);
  },
  "Rock.Field.Types.ImageFieldType": function(value, defaultValue) {
    if (
      !this ||
      !this.models ||
      !this.models.BinaryFile ||
      (!value && !defaultValue)
    )
      return Promise.resolve({});

    if (!value && defaultValue)
      return this.models.BinaryFile.getFromGuid(defaultValue);
    return this.models.BinaryFile.getFromGuid(value);
  },
  "Rock.Field.Types.DecimalRangeFieldType": function(value, defaultValue) {
    if (!value && !defaultValue) return [];
    if (!value && defaultValue) value = defaultValue;

    const range = value.split(",");
    return range.map(x => Number(x));
  },
  "Rock.Field.Types.DefinedValueFieldType": function(value, defaultValue) {
    if (!this || !this.models || !this.models.Rock || (!value && !defaultValue))
      return Promise.resolve({});

    if (!value && defaultValue)
      return this.models.Rock.getDefinedValueByGuid(defaultValue);
    return this.models.Rock.getDefinedValueByGuid(value);
  }
};
