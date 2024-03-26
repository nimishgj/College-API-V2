const { getDocumentsByOwner } = require("../controllers/documents");
const { sendInvalidParameterResponse, sendServerError } = require("../util/Responses");
const docs = require("../models/Document.model");
const Users = require("../models/User.model");

jest.mock("../middleware/logger/logger", () => ({
  log: jest.fn(),
}));

describe('Testing Getting Documents By Uploader', () => {
  let originalFind;

  beforeEach(() => {
    originalFind = docs.find;
    docs.find = jest.fn();
    jest.resetAllMocks(); // Clear mocks between tests for isolation
  });

  afterEach(() => {
    docs.find = originalFind;
  });

  it('Should return a list of documents when valid ownerId is provided', async () => {
    // Arrange
    const request = { params: { ownerId: "1234567890" }, user: { name: "asd", _id: "dfdsf" } };
    const response = {
      status: jest.fn(() => response),
      json: jest.fn(),
    };

    // Mock functions with expected behavior
    Users.findById.mockReturnValueOnce({
      id: "dfdsf",
      name: "asd",
      documents: [
        { id: "doc1", name: "Document 1" },
        { id: "doc2", name: "Document 2" },
      ],
    });

    docs.find.mockResolvedValueOnce([
      { id: "doc1", name: "Document 1" },
      { id: "doc2", name: "Document 2" },
    ]);

    // Act
    await getDocumentsByOwner(request, response);

    // Assert
    expect(Users.findById).toHaveBeenCalledWith("dfdsf");
    expect(docs.find).toHaveBeenCalledWith({ owner: "asd" });
    expect(require("../middleware/logger/logger").log).toHaveBeenCalledWith(
      request,
      `asd Fetched All the Documents By OwnerId 1234567890`,
      "controllers/documents.js/getDocumentsByOwner",
      "api request",
      "info" // Correct log type
    );
    expect(response.json).toHaveBeenCalledWith({ success: true, documents: [{ id: "doc1", name: "Document 1" }, { id: "doc2", name: "Document 2" }] });
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("send invalid parameters response", async () => {
    // Arrange
    const request = { params: {}, user: {} }; // Empty params
    const response = { status: jest.fn(() => response), json: jest.fn() };

    // Act
    await getDocumentsByOwner(request, response);

    // Assert
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ success: false, error: "Invalid Request,Missing Parameters" });
  });

  it("send server error response", async () => {
    // Arrange
    const request = { params: { ownerId: "123" }, user: { _id: "dfdsf", name: "asd" } };
    const response = { status: jest.fn(() => response), json: jest.fn() };
    const errorMessage = "Error fetching documents";

    // Mock `docs.find` to throw an error
    docs.find.mockRejectedValueOnce(new Error(errorMessage));

    // Act
    await getDocumentsByOwner(request, response);

    // Assert
    expect(require("../middleware/logger/logger").log).toHaveBeenCalledWith(
      request,
      `Error Occured While Fetching All the Documents from user dfdsf`,
      "controllers/documents.js/getDocumentsByOwner",
      "ERR GEN",
      "ERROR" // Correct log type
    );
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ success: false, error: "Internal Server Error" });
  });
});
