const seed = require("../db/seeds/seed");
const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");

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
  test("404: API does not exist", () => {
    return request(app)
      .get("/api/not_an_valid_path")
      .expect(404)
      .then((response) => {
        expect(response.res.statusMessage).toBe("Not Found");
      });
  });
});

describe("GET articles", () => {
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
        expect(body.msg).toBe("Invalid article_id");
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
        expect(body.msg).toBe("Invalid article_id");
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
