export default [
  `
  type GGeoLocate {
    destination_addresses: [String]
    origin_addresses: [String]
    rows: [GGeoRow]
    status: String
  }

  type GGeoRow {
    elements: [GGeoElement]
  }

  type GGeoElement {
    distance: GGeoValue
    duration: GGeoValue
    status: String
  }

  type GGeoValue {
    text: String
    value: Int
  }
`
];
