const MongoClient = require("mongodb").MongoClient;

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "master";

// Use connect method to connect to the server
MongoClient.connect(url, async function (err, client) {
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  // Users Topics
  const Users = db.collection("users");
  const userTopicsAggCursor = await Users.aggregate([
    {
      $match: {
        "topics.0": { $exists: true },
      },
    },
    {
      $unwind: "$topics",
    },
    {
      $project: {
        _id: {
          $concat: ["$_id", "$topics"],
        },
        userId: "$services.rock.PrimaryAliasId",
        topic: "$topics",
        __v: { $literal: 0 },
      },
    },
    {
      $out: "user_ignored_topics",
    },
  ]);

  await userTopicsAggCursor.toArray();

  // User Likes
  await db.collection("likes").rename("old_likes");

  const Likes = db.collection("old_likes");
  const userLikesAggCursor = await Likes.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        userId: "$user.services.rock.PrimaryAliasId",
        entryId: 1,
        createdAt: 1,
        __v: { $literal: 0 },
      }
    },
    {
      $out: "likes",
    },
  ]);
  await userLikesAggCursor.toArray();

  var cursor = Likes.find();
  while (cursor.hasNext()) {
    var doc = cursor.next();
    Likes.update(
        {"_id" : doc._id},
        {"$set" : {"createdAt" : new ISODate(doc.createdAt)}}
      )
  };

  client.close();
});
