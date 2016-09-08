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

test("`Campus` queries data from either Id or Name.", t => {
  const { Query } = Resolver;

  const sampleId = 7;
  const sampleName = "Greenville";
  const models = {
    Campus: {
      find({ Id , Name }) {
        t.is(Id, sampleId);
        t.is(Name, sampleName);
      },
    },
  };

  Query.campuses(null, { id: sampleId,  name: sampleName}, { models });
});

test("`Campus` should have an Id.", t => {
  const { Campus } = Resolver;

  const entityId = Campus.entityId(sampleData.campuses);
  t.deepEqual(entityId, sampleData.campuses.Id);
});

test("`Campus` should have a name.", t => {
  const { Campus } = Resolver;

  const name = Campus.name(sampleData.campuses);
  t.deepEqual(name, sampleData.campuses.Name);
});

test("`Campus` should have a url.", t => {
  const { Campus } = Resolver;

  const url = Campus.url(sampleData.campuses);
  t.deepEqual(url, sampleData.campuses.Url);
});

test("`Campus` should have service times formmated correctly", t => {
  const { Campus } = Resolver;

  const services = Campus.services(sampleData.campuses);
  t.deepEqual(services, [
    "Sunday at 9:15am & 11:15am",
  ]);
});

test("`Campus` should have a shortCode.", t => {
  const { Campus } = Resolver;

  const shortCode = Campus.shortCode(sampleData.campuses);
  t.deepEqual(shortCode, sampleData.campuses.ShortCode);
});

test("`Campus` should have a guid.", t => {
  const { Campus } = Resolver;

  const guid = Campus.guid(sampleData.campuses);
  t.deepEqual(guid, sampleData.campuses.Guid);
});

test("`Campus` should have a locationId.", t => {
  const { Campus } = Resolver;

  const locationId = Campus.locationId(sampleData.campuses);
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

test("`Location` should return address name.", t => {
  const { Location } = Resolver;

  const Name = Location.name(sampleData.location);
  t.deepEqual(Name, sampleData.location.Name);
});

test("`Location` should return address street1.", t => {
  const { Location } = Resolver;

  const Street1 = Location.street1(sampleData.location);
  t.deepEqual(Street1, sampleData.location.Street1);
});

test("`Location` should return address street2.", t => {
  const { Location } = Resolver;

  const Street2 = Location.street2(sampleData.location);
  t.deepEqual(Street2, sampleData.location.Street2);
});

test("`Location` should return address state.", t => {
  const { Location } = Resolver;

  const State = Location.state(sampleData.location);
  t.deepEqual(State, sampleData.location.State);
});

test("`Location` should return address zip code.", t => {
  const { Location } = Resolver;

  const Zip = Location.zip(sampleData.location);
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
