const Auth = {
  Person: {
    enforceReadPerm: (context, person) => {
      if (context.user === null || context.user.services.rock.PrimaryAliasId !== person.Id) {
        throw new Error("Not authorized");
      }
    },
  },
};

export default Auth;
