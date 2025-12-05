javascript
module.exports = {
  openapi: "3.0.0",
  info: {
    title: "API SAST",
    version: "1.0.0",
    description: "API com CI/CD DevSecOps",
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
          },
        },
      },
    },
    "/api/items": {
      get: {
        summary: "List all items",
        responses: {
          200: {
            description: "Success",
          },
        },
      },
      post: {
        summary: "Create item",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
          },
        },
      },
    },
  },
};