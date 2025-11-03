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

// Mock the MongoDB helper
jest.mock("../../../../src/utils/mongo");

describe("GET /api/reports/sales/sales-by-year", () => {
  // Reset mock call history before each test
  beforeEach(() => {
    mongo.mockClear();
  });

  /**
   * Test 1:
   * Ensures endpoint returns expected structure when data exists.
   */
  it("should return 200 and yearly sales data", async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnValue({
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              { year: 2023, totalSales: 200, count: 2 },
              { year: 2024, totalSales: 500, count: 1 },
            ]),
          }),
        }),
      };
      await callback(db);
    });

    // Make request to API
    const res = await request(app).get("/api/reports/sales/sales-by-year");

    // Response has correct structure
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("year");
    expect(res.body[0]).toHaveProperty("totalSales");
    expect(res.body[0]).toHaveProperty("count");
  });

  /**
   * Test 2:
   * Ensures filtering logic works properly.
   */
  it("should filter results by startYear and endYear", async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnValue({
          aggregate: jest.fn().mockReturnValue({
            toArray: jest
              .fn()
              .mockResolvedValue([{ year: 2024, totalSales: 500, count: 1 }]),
          }),
        }),
      };
      await callback(db);
    });

    const res = await request(app).get(
      "/api/reports/sales/sales-by-year?startYear=2024&endYear=2024"
    );

    // All results must be year 2024
    expect(res.status).toBe(200);
    expect(res.body.every((r) => r.year === 2024)).toBe(true);
  });

  /**
   * Test 3:
   * Ensures empty set scenario does not break API.
   */
  it("should return an empty array when no results match", async () => {
    // Returns no results
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnValue({
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
        }),
      };
      await callback(db);
    });

    const res = await request(app).get(
      "/api/reports/sales/sales-by-year?startYear=2010&endYear=2011"
    );

    // 200 with empty array is valid case
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
