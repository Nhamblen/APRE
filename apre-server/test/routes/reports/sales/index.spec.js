/**
 * Author: Professor Krasso
 * Date: 10 September 2024
 * File: index.spec.js
 * Description: Test the sales report API
 */

// Require the modules
const request = require("supertest");
const app = require("../../../../src/app");
const { mongo } = require("../../../../src/utils/mongo");

jest.mock("../../../../src/utils/mongo");

// Test the sales report API
describe("Apre Sales Report API - Regions", () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions endpoint
  it("should fetch a list of distinct sales regions", async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest
          .fn()
          .mockResolvedValue(["North", "South", "East", "West"]),
      };
      await callback(db);
    });

    const response = await request(app).get("/api/reports/sales/regions"); // Send a GET request to the sales/regions endpoint

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual(["North", "South", "East", "West"]); // Expect the response body to match the expected data
  });

  // Test the sales/regions endpoint with no regions found
  it("should return 404 for an invalid endpoint", async () => {
    const response = await request(app).get(
      "/api/reports/sales/invalid-endpoint"
    ); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404); // Expect a 404 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: "Not Found",
      status: 404,
      type: "error",
    });
  });

  // Test the sales/regions endpoint with no regions found
  it("should return 200 with an empty array if no regions are found", async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([]),
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get("/api/reports/sales/regions");

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual([]); // Expect the response body to match the expected data
  });
});

// Test the sales report API
describe("Apre Sales Report API - Sales by Region", () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions/:region endpoint
  it("should fetch sales data for a specific region, grouped by salesperson", async () => {
    mongo.mockImplementation(async (callback) => {
      // Mock the MongoDB collection
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              salesperson: "John Doe",
              totalSales: 1000,
            },
            {
              salesperson: "Jane Smith",
              totalSales: 1500,
            },
          ]),
        }),
      };
      await callback(db);
    });

    const response = await request(app).get("/api/reports/sales/regions/north"); // Send a GET request to the sales/regions/:region endpoint
    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        salesperson: "John Doe",
        totalSales: 1000,
      },
      {
        salesperson: "Jane Smith",
        totalSales: 1500,
      },
    ]);
  });

  it("should return 200 and an empty array if no sales data is found for the region", async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get(
      "/api/reports/sales/regions/unknown-region"
    );

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should return 404 for an invalid endpoint", async () => {
    // Make a request to an invalid endpoint
    const response = await request(app).get(
      "/api/reports/sales/invalid-endpoint"
    );

    // Assert the response
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Not Found",
      status: 404,
      type: "error",
    });
  });
});

/** Major development task - server tests 11/2/25
 *
 * Create an API to fetch yearly sales data and build an Angular component to display
 * yearly sales using ChartComponent or TableComponent with 3 unit tests each.
 *
 * Implement the API to fetch yearly sales data and create a component to display
 * the data using either ChartComponent or TableComponent. Ensure both have 3 unit tests.
 *
 */

describe("GET /api/reports/sales/sales-by-year", () => {
  /**
   * Runs once before all tests.
   * Clears the existing "sales" collection and insert test data.
   */
  beforeAll((done) => {
    mongo(async (db) => {
      await db.collection("sales").deleteMany({});
      await db.collection("sales").insertMany([
        { amount: 50, saleDate: new Date("2023-01-10") },
        { amount: 150, saleDate: new Date("2023-09-18") },
        { amount: 500, saleDate: new Date("2024-04-03") },
      ]);
      done();
    }, done);
  });

  /**
   * Runs once after all tests finish.
   * Removes all temporary data to keep the DB clean.
   */
  afterAll((done) => {
    mongo(async (db) => {
      await db.collection("sales").deleteMany({});
      done();
    }, done);
  });

  /**
   * Test #1
   * - Returns HTTP 200 status code
   * - Returns an array of results
   * - Includes required fields in objects
   */
  it("should return 200 and yearly sales data", async () => {
    const res = await request(app).get("/api/reports/sales/sales-by-year");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Ensure necessary fields exist on each result object
    expect(res.body[0]).toHaveProperty("year");
    expect(res.body[0]).toHaveProperty("totalSales");
    expect(res.body[0]).toHaveProperty("count");
  });

  /**
   * Test #2
   * - Validates that filtering by year works correctly
   * - Only 2024 results should be returned in this example.
   */
  it("should filter results by startYear and endYear range", async () => {
    const res = await request(app).get(
      "/api/reports/sales/sales-by-year?startYear=2024&endYear=2024"
    );

    expect(res.status).toBe(200);
    expect(res.body.every((r) => r.year === 2024)).toBe(true);
  });

  /**
   * Test #3
   * - Ensures the API handles unmatched criteria correctly
   * - Should return an empty array, not an error.
   */
  it("should return empty array if no results exist for filter", async () => {
    const res = await request(app).get(
      "/api/reports/sales/sales-by-year?startYear=2010&endYear=2011"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
