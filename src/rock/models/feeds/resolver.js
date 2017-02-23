
import { flatten } from "lodash";

// for filtering news. allows logged out users to see gloabl news only,
// and logged in users to see global and their campus
/*
  userCampus: { Guid: "" }
  entryCampus: { Guid: "" }
  => truthy/falsy
*/
export const shouldShowEntry = (userCampus, entryCampus) => {
  return !userCampus
    ? !entryCampus
    : Boolean(!entryCampus || (userCampus.Guid === entryCampus.Guid))
}

export default {

  Query: {
    userFeed: async (_, { filters, limit, skip, status, cache, options = "{}" }, { models, person, user }) => {
      if (!filters) return null;

      const opts = JSON.parse(options);
      const filterQueries = [];

      // Home feed query
      if (filters.includes("CONTENT")) {
        let { channels } = opts.content;

        channels = channels
          .map(x => x.toLowerCase())
          .map((x) => {
            if (x === "series") return ["series_newspring"];
            if (x === "music") return ["newspring_albums"];
            if (x === "devotionals") return ["study_entries", "devotionals"];
            if (x === "events") return ["newspring_now"];
            return [x];
          })
          .map(flatten);

        const showsNews = flatten(channels).includes("news");

        //get user's campus to filter news by
        let userCampus = (person && showsNews)
          ? await models.Person.getCampusFromId(person.Id, { cache })
          : null;

        // TODO: filter other campuses by lookup query here
        let content = await models.Content.find({
          channel_name: { $or: channels }, offset: skip, limit, status,
        }, cache);

        // logged out only see global news
        // logged in only see news that is global, or their campus
        if (showsNews) {
          /*
            XXX since you can't filter on an async filter function, I have to iterate over
            the array of entries and add a shouldBeShown key than I can use to filter on after
          */
          for (let i=0; i < content.length; i++) {
            const entryCampus = await content[i].campus
              ? await models.Campus.find({ Name: content[i].campus.split(" ")[2] }).then(x => x.shift())
              : null;
            content[i] = { ...content[i], shouldBeShown: shouldShowEntry(userCampus, entryCampus) };
          }

          content = content.filter( x => x.shouldBeShown );

        }

        // add filtered items to the list
        filterQueries.push(content);
      }

      if (filters.includes("GIVING_DASHBOARD") && person) {
        filterQueries.push(models.Transaction.findByPersonAlias(
          person.aliases, { limit: 3, offset: 0 }, { cache: null },
        ));

        filterQueries.push(models.SavedPayment.findByPersonAlias(
          person.aliases, { limit: 3, offset: 0 }, { cache: null },
        ));
      }

      if (filters.includes("LIKES") && user) {
        filterQueries.push(models.Like.getLikedContent(user._id, models.Node));
      }

      //for news section in app -- all news
      if (filters.includes("NEWS")) {
        filterQueries.push(models.Content.find({
          channel_name: "news", offset: skip, limit, status,
        }, cache));
      }

      if (!filterQueries.length) return null;

      return Promise.all(filterQueries)
        .then(flatten);
    },
  },
};
