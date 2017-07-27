import { flatten } from "lodash";

export default {
  Query: {
    userFeed: async (
      _,
      { filters, limit, skip, status, cache, options = "{}" },
      { models, person, user },
    ) => {
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

        // get user's campus to filter news by
        const userCampus =
          person && showsNews ? await models.Person.getCampusFromId(person.Id, { cache }) : null;

        const EEContent = await models.Content.findByCampusName(
          {
            channel_name: { $or: channels },
            offset: skip,
            limit,
            status,
          },
          userCampus ? userCampus.Name : null,
          true,
        );

        const RKContent = await models.RockContent.find(
          {
            channel: "All Staff News",
            offset: skip,
            limit,
          },
          cache,
        );

        filterQueries.push(RKContent);
      }

      if (filters.includes("GIVING_DASHBOARD") && person) {
        filterQueries.push(
          models.Transaction.findByPersonAlias(
            person.aliases,
            { limit: 3, offset: 0 },
            { cache: null },
          ),
        );

        filterQueries.push(
          models.SavedPayment.findByPersonAlias(
            person.aliases,
            { limit: 3, offset: 0 },
            { cache: null },
          ),
        );
      }

      if (filters.includes("LIKES") && user) {
        const likedContent = await models.Like.getLikedContent(user._id, models.Node);
        const reversed = Array.isArray(likedContent) ? likedContent.reverse() : likedContent;
        filterQueries.push(reversed);
      }

      if (!filterQueries.length) return null;

      return Promise.all(filterQueries).then(flatten).then(x => x.filter(y => Boolean(y))).then(z =>
        z.sort((a, b) => {
          let aDate;
          let bDate;
          if (a.__type === "Content") {
            aDate = `${a.exp_channel_title.year}-${a.exp_channel_title.month}-${a.exp_channel_title
              .day}`;
          } else {
            aDate = a.StartDateTime.slice(0, 10);
          }
          if (b.__type === "Content") {
            bDate = `${b.exp_channel_title.year}-${b.exp_channel_title.month}-${b.exp_channel_title
              .day}`;
          } else {
            bDate = b.StartDateTime.slice(0, 10);
          }
          aDate = new Date(aDate);
          bDate = new Date(bDate);
          return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
        }),
      );
    },
  },
};
