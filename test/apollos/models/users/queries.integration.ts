import test from "ava";
import express from "express";
import { apolloExpress } from "apollo-server";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";

import { createApp } from "../../../../src/schema";

let Heighliner;
test.before(async (t) => {
  const app = express();
  const { graphql } = await createApp();

  app.use("/graphql", apolloExpress(graphql));

  Heighliner = tester({
    server: create(app),
    url: "/graphql",
  });

});


test("Valid queries should return success", async (t) => {
  const response = await Heighliner(`
    query CurrentUser {
      currentUser {
        id
        createdAt
        emails {
          address
        }
        services {
          rock {
            id
            alias
          }
          resume {
            tokens {
              when
              hashedToken
            }
          }
        }
      }
    }
  `);
  t.true(response.success);
  t.is(response.status, 200);
  t.truthy(response.data);
});
