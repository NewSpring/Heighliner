const Auth = {
  Person: {
    enforceReadPerm: (context, person) => {
      if (context.user === null || context.user.services.rock.PersonId !== person.Id) {
        throw new Error("Not authorized");
      }
    },
  },
};

export default Auth;
