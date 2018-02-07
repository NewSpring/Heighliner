export default {
  Mutation: {
    async attachPhotoIdToUser(_, props, { models, user }) {
      try {
        // NOTE: context person could be cached
        // therefore we need to query again
        const person = await models.User.getUserProfile(user.PersonId);
        return models.BinaryFile.attachPhotoIdToUser({
          personId: person.Id,
          previousPhotoId: person.PhotoId,
          newPhotoId: props.id,
        });
      } catch (err) {
        throw err;
      }
    },
  },
};
