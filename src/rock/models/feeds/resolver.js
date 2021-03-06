import { flatten } from "lodash";

export default {
  Query: {
    userFeed: async (
      _,
      { filters, limit, skip, status, cache },
      { models, person, user }
    ) => {
      if (!filters) return null;

      const filterQueries = [];

      // Home feed query
      if (filters.includes("CONTENT")) {
        const topics = await models.User.getUserFollowingTopics(
          person && person.PrimaryAliasId
        );

        const channels = topics
          .map(x => x.toLowerCase())
          .map(x => {
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
          person && showsNews
            ? await models.Person.getCampusFromId(person.Id, { cache })
            : null;

        const content = await models.Content.findByCampusName(
          {
            channel_name: { $or: channels },
            offset: skip,
            limit,
            status
          },
          userCampus ? userCampus.Name : null,
          true
        );

        filterQueries.push(content);
      }

      if (filters.includes("GIVING_DASHBOARD") && person) {
        filterQueries.push(
          models.Transaction.findByPersonAlias(
            person.aliases,
            { limit: 3, offset: 0 },
            { cache: null }
          )
        );

        filterQueries.push(
          models.SavedPayment.findExpiringByPersonAlias(
            person.aliases,
            { limit: 3, offset: 0 },
            { cache: null }
          )
        );
      }

      if (filters.includes("LIKES") && user) {
        const likedContent = await models.Like.getLikedContent(
          person.PrimaryAliasId,
          models.Node
        );
        const reversed = Array.isArray(likedContent)
          ? likedContent.reverse()
          : likedContent;
        filterQueries.push(reversed);
      }

      if (!filterQueries.length) return null;

      return Promise.all(filterQueries)
        .then(flatten)
        .then(x => x.filter(y => Boolean(y)));
    }
  }
};
