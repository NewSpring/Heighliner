import Resolver from "../resolver";

const sampleData = {
  campuses: {
    Id: "abc",
    EntityId: 2,
    Name: "Aiken",
    ShortCode: "AKN",
    Guid: "15DDDE79-1999-49F5-9C97-79DE3066073C",
    LocationId: "14",
    Url: "https://google.com",
    ServiceTimes: "Sunday^9:15am|Sunday^11:15am|",
  },
  location: {
    Id: "a133f80c70ea2a02c09c61c296ad9673",
    Name: "Aiken",
    State: "SC",
    Street1: "375 Robert M Bell Pkwy",
    Street2: "Usc Aiken Convocation Center",
    City: "Aiken",
    PostalCode: "29801-6385",
    Latitude: 33.57248,
    Longitude: -81.76644,
  },
};

it("`Campus` queries data from either Id or Name.", () => {
  const { Query } = Resolver;

  const sampleId = 7;
  const sampleName = "Greenville";
  const models = {
    Campus: {
      find({ Id , Name }) {
        expect(Id).toEqual(sampleId);
        expect(Name).toEqual(sampleName);
      },
    },
  };

  Query.campuses(null, { id: sampleId,  name: sampleName}, { models });
});

it("`Campus` should have an Id.", () => {
  const { Campus } = Resolver;

  const entityId = Campus.entityId(sampleData.campuses);
  expect(entityId).toEqual(sampleData.campuses.Id);
});

it("`Campus` should have a name.", () => {
  const { Campus } = Resolver;

  const name = Campus.name(sampleData.campuses);
  expect(name).toEqual(sampleData.campuses.Name);
});

it("`Campus` should have a url.", () => {
  const { Campus } = Resolver;

  const url = Campus.url(sampleData.campuses);
  expect(url).toEqual(sampleData.campuses.Url);
});

it("`Campus` should have service times formmated correctly", () => {
  const { Campus } = Resolver;

  const services = Campus.services(sampleData.campuses);
  expect(services).toEqual([
    "Sunday at 9:15am & 11:15am",
  ]);
});

it("`Campus` should have a shortCode.", () => {
  const { Campus } = Resolver;

  const shortCode = Campus.shortCode(sampleData.campuses);
  expect(shortCode).toEqual(sampleData.campuses.ShortCode);
});

it("`Campus` should have a guid.", () => {
  const { Campus } = Resolver;

  const guid = Campus.guid(sampleData.campuses);
  expect(guid).toEqual(sampleData.campuses.Guid);
});

it("`Campus` should have a locationId.", () => {
  const { Campus } = Resolver;

  const locationId = Campus.locationId(sampleData.campuses);
  expect(locationId).toEqual(sampleData.campuses.LocationId);
});

it("`Campus` should return valid location data.", () => {
  const { Campus } = Resolver;

  const sampleId = 7;
  const models = {
    Campus: {
      findByLocationId(id) {
        expect(id).toEqual(sampleId);
      },
    },
  };

  Campus.location({ LocationId: sampleId }, null, { models });

  const noLocationId = Campus.location({LocationId: null}, null, { models });
  expect(null).toEqual(noLocationId);
});

it("`Location` should return address name.", () => {
  const { Location } = Resolver;

  const Name = Location.name(sampleData.location);
  expect(Name).toEqual(sampleData.location.Name);
});

it("`Location` should return address street1.", () => {
  const { Location } = Resolver;

  const Street1 = Location.street1(sampleData.location);
  expect(Street1).toEqual(sampleData.location.Street1);
});

it("`Location` should return address street2.", () => {
  const { Location } = Resolver;

  const Street2 = Location.street2(sampleData.location);
  expect(Street2).toEqual(sampleData.location.Street2);
});

it("`Location` should return address state.", () => {
  const { Location } = Resolver;

  const State = Location.state(sampleData.location);
  expect(State).toEqual(sampleData.location.State);
});

it("`Location` should return address zip code.", () => {
  const { Location } = Resolver;

  const Zip = Location.zip(sampleData.location);
  expect(Zip).toEqual(sampleData.location.PostalCode);
});

it("`Location` should return latitude.", () => {
  const { Location } = Resolver;

  const noGeoPoint = Location.latitude({ GeoPoint: null, latitude: null});
  expect(null).toEqual(noGeoPoint);

  const Latitude = Location.latitude({ GeoPoint: null, latitude: sampleData.location.Latitude });
  expect(sampleData.location.Latitude).toEqual(Latitude);
});

it("`Location` should return longitude.", () => {
  const { Location } = Resolver;

  const noGeoPoint = Location.longitude({ GeoPoint: null, longitude: null});
  expect(null).toEqual(noGeoPoint);

  const Longitude = Location.longitude({
    GeoPoint: null,
    longitude: sampleData.location.Longitude,
  });

  expect(sampleData.location.Longitude).toEqual(Longitude);
});
