const seed = require("../db/seeds/seed");
const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");
const jestSorted = require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("GET topics", () => {
  test("200: gets all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics.length > 0).toBe(true);

        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test("400: Invalid API", () => {
    return request(app)
      .get("/api/not_an_valid_path")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Path");
      });
  });
});

describe("GET article by id", () => {
  test("200: gets article by id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body.article).toBe("object");
        expect(Object.keys(body.article).length).toBe(8);

        expect(body.article).toMatchObject({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          comment_count: 11,
        });
      });
  });
  test("404: article_id not exists", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article_id is not found");
      });
  });
  test("400: Invalid article_id", () => {
    return request(app)
      .get("/api/articles/one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid id");
      });
  });
});

describe("GET users", () => {
  test("200: gets all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true);
        expect(body.users.length > 0).toBe(true);

        body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("PATCH article", () => {
  test("200: update article votes by article_id", () => {
    const propToUpdate = { inc_votes: 100 };
    const updatedArticle = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 200,
    };

    return request(app)
      .patch("/api/articles/1")
      .send(propToUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(updatedArticle);
      });
  });
  test("400: inc_vote key is not found", () => {
    const propToUpdate = { votes: 100 };

    return request(app)
      .patch("/api/articles/1")
      .send(propToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("inc_vote key is not found");
      });
  });
  test("400: Wrong data type", () => {
    const propToUpdate = { inc_votes: "one hundred" };

    return request(app)
      .patch("/api/articles/1")
      .send(propToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Wrong data type");
      });
  });
  test("400: Invalid article_id", () => {
    const propToUpdate = { inc_votes: 100 };

    return request(app)
      .patch("/api/articles/one")
      .send(propToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid id");
      });
  });
  test("404: article_id does not exist", () => {
    const propToUpdate = { inc_votes: 100 };

    return request(app)
      .patch("/api/articles/9999")
      .send(propToUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article_id does not exist");
      });
  });
});

describe("GET articles", () => {
  test("200: get all articles including property comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(12);

        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("200: get all articles by default descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: get articles filtered by a valid custom query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(11);
        expect(body.articles).toBeSortedBy("created_at", { descending: true });

        body.articles.forEach((article) => {
          expect(article).toEqual({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: "mitch",
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: sort articles by a valid column and default descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(12);
        expect(body.articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("200: sort articles by a valid column and custom ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(12);
        expect(body.articles).toBeSortedBy("author");
      });
  });
  test("200: get articles filtered by a valid query, sort articles by a valid column and custom ascending order", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=author&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(11);
        expect(body.articles).toBeSortedBy("author");
        body.articles.forEach((article) => {
          expect(article).toEqual({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: "mitch",
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: topic exists but empty", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("No article with this topic");
      });
  });
  test("404: topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=not_topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic does not exist");
      });
  });
  test("400: invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid topic");
      });
  });
  test("400: Invalid column", () => {
    return request(app)
      .get("/api/articles?sort_by=not_valid_column")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid column");
      });
  });
  test("400: invalid order query", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=invalid_order")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order query");
      });
  });
  test("404: sort_by and order valid but topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=not_exist_topic&sort_by=author&order=asc")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic does not exist");
      });
  });
  test("400: sort_by and order valid but with invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=&sort_by=author&order=asc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid topic");
      });
  });
});

describe("GET comments", () => {
  test("200: get comments by article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(11);

        body.comments.forEach((comment) => {
          expect(Object.keys(comment).length).toBe(5);
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            })
          );
        });
      });
  });
  test("200: no comments with the provided article_id", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("No comments with this article_id");
      });
  });
  test("404: article_id does not exist", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article_id does not exist");
      });
  });
  test("400: invalid article_id", () => {
    return request(app)
      .get("/api/articles/one/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid id");
      });
  });
});

describe("POST comment", () => {
  test("201: post comment by article_id", () => {
    const newComment = { username: "lurker", body: "totally" };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        expect(body.comment).toMatchObject({
          comment_id: 19,
          body: "totally",
          article_id: 11,
          author: "lurker",
          votes: 0,
          created_at: expect.stringMatching(datePattern),
        });
      });
  });
  test("400: username does not exist", () => {
    const newComment = { username: "not_exist_user", body: "totally" };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("username does not exist");
      });
  });
  test("400: article_id does not exist", () => {
    const newComment = { username: "not_exist_user", body: "totally" };
    return request(app)
      .post("/api/articles/999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article_id does not exist");
      });
  });
  test("400: wrong data type", () => {
    const newComment = { username: "lurker", body: true };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Wrong data type");
      });
  });
  test("400: incomplete comment", () => {
    const newComment = { username: "lurker" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Incomplete comment");
      });
  });
});

describe("DELETE comment", () => {
  test("204: delete comment by comment_id", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("404: comment_id does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Comment_id does not exist");
      });
  });
  test("400: invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid id");
      });
  });
  test("400: Invalid Path", () => {
    return request(app)
      .delete("/api/comments/")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid Path");
      });
  });
});

describe("GET api", () => {
  test("200: get all api description", () => {
    const api = {
      "GET /api": {
        description:
          "serves up a json representation of all the available endpoints of the api",
      },
      "GET /api/topics": {
        description: "serves an array of all topics",
        queries: [],
        exampleResponse: {
          topics: [{ slug: "football", description: "Footie!" }],
        },
      },
      "GET /api/users": {
        description: "serves an array of all topics",
        queries: [],
        exampleResponse: {
          topics: [
            {
              username: "butter_bridge",
              name: "jonny",
              avatar_url:
                "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
            },
          ],
        },
      },
      "GET /api/articles": {
        description: "serves an array of all articles",
        queries: ["author", "topic", "sort_by", "order"],
        exampleResponse: {
          articles: [
            {
              title: "Seafood substitutions are increasing",
              topic: "cooking",
              author: "weegembump",
              body: "Text from the article..",
              created_at: "2020-09-16T16:26:00.000Z",
            },
          ],
        },
      },
      "GET /api/articles/:article_id": {
        description: "serves a specific article",
        queries: [],
        exampleResponse: {
          article: {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
          },
        },
      },
      "GET /api/articles/:article_id/comments": {
        description: "serves an array of comments of specific article",
        queries: ["author", "topic", "sort_by", "order"],
        exampleResponse: {
          comments: [
            {
              comment_id: 2,
              body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
              author: "butter_bridge",
              votes: 14,
              created_at: "2020-10-31T03:03:00.000Z",
            },
            {
              comment_id: 3,
              body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
              author: "icellusedkars",
              votes: 100,
              created_at: "2020-03-01T01:13:00.000Z",
            },
          ],
        },
      },
      "PATCH /api/articles/:article_id": {
        description: "update a specific article votes",
        queries: [],
        exampleRequest: { inc_votes: 100 },
        exampleResponse: {
          article: {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 200,
          },
        },
      },
      "POST /api/articles/:article_id/comments": {
        description: "add a new comment to a specific article",
        queries: [],
        exampleRequest: { username: "lurker", body: "totally" },
        exampleResponse: {
          comment: {
            comment_id: 19,
            body: "totally",
            article_id: 11,
            author: "lurker",
            votes: 0,
            created_at: "2022-09-08T11:49:35.538Z",
          },
        },
      },
      "DELETE /api/comments/:comment_id": {
        description: "delete a specific comment",
        queries: [],
        exampleResponse: {},
      },
    };
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ _body }) => {
        expect(_body).toEqual(api);
      });
  });
});

describe("GET user by username", () => {
  test("200: get user by username", () => {
    const user = {
      username: "butter_bridge",
      name: "jonny",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    };
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("400: invalid username", () => {
    return request(app)
      .get("/api/users/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User does not exist");
      });
  });
});

describe("PATCH comment", () => {
  test("200: patch comment by comment_id", () => {
    const propToUpdate = { inc_votes: 10 };
    return request(app)
      .patch("/api/comments/1")
      .send(propToUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          votes: 24,
          author: "butter_bridge",
          article_id: 1,
          created_at: "2020-10-31T03:03:00.000Z",
        });
      });
  });
  test("200: patch comment by comment_id with negative number", () => {
    const propToUpdate = { inc_votes: -10 };
    return request(app)
      .patch("/api/comments/1")
      .send(propToUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          votes: 4,
          author: "butter_bridge",
          article_id: 1,
          created_at: "2020-10-31T03:03:00.000Z",
        });
      });
  });
  test("400: inc_votes key is not found", () => {
    const propToUpdate = { inc: 10 };
    return request(app)
      .patch("/api/comments/1")
      .send(propToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("inc_votes key is not found");
      });
  });
  test("400: wrong data type", () => {
    const propToUpdate = { inc_votes: "ten" };
    return request(app)
      .patch("/api/comments/1")
      .send(propToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Wrong data type");
      });
  });
  test("400: invalid comment_id", () => {
    const propToUpdate = { inc_votes: 10 };
    return request(app)
      .patch("/api/comments/one")
      .send(propToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid id");
      });
  });
  test("404: comment_id does not exist", () => {
    const propToUpdate = { inc_votes: 10 };
    return request(app)
      .patch("/api/comments/9999")
      .send(propToUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment_id does not exist");
      });
  });
});

describe("POST articles", () => {
  test("201: post articles", () => {
    const newArticle = {
      author: "lurker",
      title: "How to become a web developer",
      body: "How to become a web developer? Go to bootcamp!",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(Object.keys(body.article).length).toBe(8);

        const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        expect(body.article).toMatchObject({
          article_id: 13,
          title: "How to become a web developer",
          topic: "mitch",
          author: "lurker",
          body: "How to become a web developer? Go to bootcamp!",
          created_at: expect.stringMatching(datePattern),
          votes: 0,
          comment_count: 0,
        });
      });
  });
  test("400: username does not exist", () => {
    const newArticle = {
      author: "not_exist_user",
      title: "How to become a web developer",
      body: "How to become a web developer? Go to bootcamp!",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("username does not exist");
      });
  });
  test("400: topic does not exist", () => {
    const newArticle = {
      author: "lurker",
      title: "How to become a web developer",
      body: "How to become a web developer? Go to bootcamp!",
      topic: "not_exist_topic",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("topic does not exist");
      });
  });
  test("400: wrong data type", () => {
    const newArticle = {
      author: "lurker",
      title: "How to become a web developer",
      body: "How to become a web developer? Go to bootcamp!",
      topic: 1234,
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("wrong data type");
      });
  });
  test("400: incomplete article", () => {
    const newArticle = {
      author: "lurker",
      title: "How to become a web developer",
      body: "How to become a web developer? Go to bootcamp!",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("imcomplete article");
      });
  });
});
