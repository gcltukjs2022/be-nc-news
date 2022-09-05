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

describe("GET", () => {
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

describe("GET", () => {
  test("200: gets article by id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body.article).toBe("object");
        expect(Object.keys(body.article).length).toBe(7);

        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
        });
      });
  });
  test("400: article_id not exists", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("No Such Article");
      });
  });
  test("404: API does not exist", () => {
    return request(app)
      .get("/api/not_an_valid_path/1")
      .expect(404)
      .then((response) => {
        expect(response.res.statusMessage).toBe("Not Found");
      });
  });
});
