import test from "ava";
import express from "express";
import { apolloServer } from "apollo-server";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";

import { createApp } from "../../../../src/schema";

let Heighliner;
test.before(async (t) => {
  const app = express();
  const { graphql } = await createApp();

  app.use("/graphql", apolloServer(graphql));

  Heighliner = tester({
    server: create(app),
    url: "/graphql",
  });
});

test("Valid queries should return sucess", async (t) => {
  const response = await Heighliner(`
    query UserLikes {
      likes {
        id
        title
        status
        channel
        channelName
        meta {
          site
          channel
          series
          urlTitle
          summary
          date
          entryDate
          startDate
          endDate
          actualDate
          siteId
          channelId
        }
        content {
          body
          description
          ooyalaId
          speaker
          isLight
          hashtag
          tags
          colors {
            id
            value
            description
          }
          images {
            id
            file
            label
            s3
            cloudfront
            duration
            title
            fileName
            fileType
            fileLabel
          }
          tracks {
            id
            file
            label
            s3
            cloudfront
            duration
            title
            fileName
            fileType
            fileLabel
          }
          scripture {
            book
            passage
          }
        }
      }
    }
  `);

  t.true(response.success);
  t.is(response.status, 200);
  t.truthy(response.data);
});

test("Valid mutation should return sucess", async (t) => {
  const response = await Heighliner(`
    mutation toggleLike {
      toggleLike(contentId: "testId") {
        id
      }
    }
  `);

  t.true(response.success);
  t.is(response.status, 200);
  t.truthy(response.data);
});
