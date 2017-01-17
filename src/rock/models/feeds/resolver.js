
import { flatten } from "lodash";

export default {

  Query: {
    userFeed: (_, { filters, limit, skip, status, cache, options = "{}" }, { models, person, user }) => {
      if (!filters) return null;

      const opts = JSON.parse(options);
      const filterQueries = [];

      if (filters.includes("CONTENT")) {
        let { channels } = opts.content;

        channels = channels
          .map(x => x.toLowerCase())
          .map((x) => {
            if (x === "series") return ["series_newspring"];
            if (x === "music") return ["newspring_albums"];
            if (x === "devotionals") return ["study_entries", "devotionals"];
            return [x];
          })
          .map(flatten);

        filterQueries.push(models.Content.find({
          channel_name: { $or: channels }, offset: skip, limit, status,
        }, cache));
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
        console.log("-------- LIKES --------");
        filterQueries.push(models.Like.getLikedContent(user._id, models.Node));
      }

      if (!filterQueries.length) return null;

      return Promise.all(filterQueries)
        .then(flatten);
    },
  },
};
