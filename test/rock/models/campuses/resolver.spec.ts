import test from "ava";
import Resolver from "../../../../src/rock/models/campuses/resolver";

const sampleData = {
  campuses: {
    Id: "abc",
    EntityId: 2,
    Name: "Aiken",
    ShortCode: "AKN",
    Guid: "15DDDE79-1999-49F5-9C97-79DE3066073C",
    LocationId: "14",
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

test("`Campus` should return basic information about a campus.", t => {
  const { Campus } = Resolver;

  const entityId = Campus.entityId(sampleData.campuses);
  const name = Campus.name(sampleData.campuses);
  const shortCode = Campus.shortCode(sampleData.campuses);
  const guid = Campus.guid(sampleData.campuses);
  const locationId = Campus.locationId(sampleData.campuses);

  t.deepEqual(entityId, sampleData.campuses.Id);
  t.deepEqual(name, sampleData.campuses.Name);
  t.deepEqual(shortCode, sampleData.campuses.ShortCode);
  t.deepEqual(guid, sampleData.campuses.Guid);
  t.deepEqual(locationId, sampleData.campuses.LocationId);
});

test("`Campus` should return valid location data.", t => {
  const { Campus } = Resolver;

  const sampleId = 7;
  const models = {
    Campus: {
      findByLocationId(id) {
        t.is(id, sampleId);
      },
    },
  };

  Campus.location({ LocationId: sampleId }, null, { models });

  const noLocationId = Campus.location({LocationId: null}, null, { models });
  t.is(null, noLocationId);
});

test("`Location` should return address.", t => {
  const { Location } = Resolver;

  const Name = Location.name(sampleData.location);
  const Street1 = Location.street1(sampleData.location);
  const Street2 = Location.street2(sampleData.location);
  const State = Location.state(sampleData.location);
  const Zip = Location.zip(sampleData.location);

  t.deepEqual(Name, sampleData.location.Name);
  t.deepEqual(Street1, sampleData.location.Street1);
  t.deepEqual(Street2, sampleData.location.Street2);
  t.deepEqual(State, sampleData.location.State);
  t.deepEqual(Zip, sampleData.location.PostalCode);
});

test("`Location` should return latitude.", t => {
  const { Location } = Resolver;

  const noGeoPoint = Location.latitude({ GeoPoint: null, latitude: null});
  t.is(null, noGeoPoint);

  const Latitude = Location.latitude({ GeoPoint: null, latitude: sampleData.location.Latitude });
  t.is(sampleData.location.Latitude, Latitude);
});

test("`Location` should return longitude.", t => {
  const { Location } = Resolver;

  const noGeoPoint = Location.longitude({ GeoPoint: null, longitude: null});
  t.is(null, noGeoPoint);

  const Longitude = Location.longitude({ GeoPoint: null, longitude: sampleData.location.Longitude });
  t.is(sampleData.location.Longitude, Longitude);
});
