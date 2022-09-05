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
