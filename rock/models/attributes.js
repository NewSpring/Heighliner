
import { api, parseEndpoint } from "../api"
import Promise from "bluebird"


let cachedDefaults = {}

function RockTypeToGraphType(type, value){

  const types = {
    ["Rock.Field.Types.TextFieldType"]: (value) => {
      return value ? value : null
    },
    ["Rock.Field.Types.FileFieldType"]: (value) => {
      return api.get(`BinaryFiles?$filter=Guid eq guid'${value}'`)
        .then(value => value[0])
        .then(value => value ? value.Url : null)
    },
    ["Rock.Field.Types.DefinedValueFieldType"]: (value) => {

      const GuidRegex = /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/gmi

      if (`${value}`.match(GuidRegex)) {
        return api.get(`DefinedValues?$filter=Guid eq guid'${value}'`)
          .then(value => value[0])
          .then(value => value.Value ? value.Value : null)
      }

      return value

    },
    ["Rock.Field.Types.BooleanFieldType"]: (value) => {
      if (value === "False") {
        return false
      }

      if (value === "True") {
        return true
      }

      let num = Number(value)
      if (typeof num === "number") {
        if (num === 1) {
          return true
        }
        return false
      }

      if (value.toLowerCase() === "true") {
        return true
      }

      return false

    },
    ["Rock.Field.Types.DecimalRangeFieldType"]: (value) => {
      try {
        let [start, end] = value.split(",")

        start = Number(start)
        end = Number(end)

        if (typeof start != "number" || typeof end != "number") {
          throw new Error("could not convert range values", [start, end])
        }

        return [start, end]
      } catch (e) {}
      return value ? value : null
    },
  }

  return new Promise((resolve) => resolve())
    .then(() => types[type](value))

}

const get = (id, key, ttl, cache) => {
  // id = 2300289

  let query = parseEndpoint(`
    AttributeValues?
      $filter=
        EntityId eq ${id} and
        Attribute/Key eq '${key}'
      &$expand=
        Attribute,
        Attribute/FieldType
      &$select=
        Value,
        Id,
        Attribute/Key,
        Attribute/Name,
        Attribute/Description,
        Attribute/FieldType/Class
  `)


  return api.get(query, {}, ttl, cache)
    .then((attributes) => {
      // this should only be one thing
      attributes = attributes.map((x) => {
        return RockTypeToGraphType(x.Attribute.FieldType.Class, x.Value)
      })

      return Promise.all(attributes)
        .then(([value]) => {

          if (!value && !cachedDefaults[key]) {
            let query = parseEndpoint(`
              Attributes?$filter=Key eq '${key}'&$select=DefaultValue
            `)

            return api.get(query, {}, ttl, cache)
              .then(([value]) => [value.DefaultValue])
              .then((value) => {
                cachedDefaults[key] = value
                return value
              })
          }

          if (value != false && !value && cachedDefaults[key]) {
            return cachedDefaults[key]
          }

          return [value]
        })
    })
    .then(([value]) => value)
}

export default {
  get
}
