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
    const req = { params: { ownerId: "1234567890" }, user: { name: "asd", _id: "dfdsf" } };
    const res = {
      status: jest.fn(() => res),
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
    await getDocumentsByOwner(req, res);

    // Assert
    expect(Users.findById).toHaveBeenCalledWith("dfdsf");
    expect(docs.find).toHaveBeenCalledWith({ owner: "asd" });
    expect(require("../middleware/logger/logger").log).toHaveBeenCalledWith(
      req,
      `asd Fetched All the Documents By OwnerId 1234567890`,
      "controllers/documents.js/getDocumentsByOwner",
      "api request",
      "info" // Correct log type
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, documents: [{ id: "doc1", name: "Document 1" }, { id: "doc2", name: "Document 2" }] });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("send invalid parameters response", async () => {
    // Arrange
    const req = { params: {}, user: {} }; // Empty params
    const res = { status: jest.fn(() => res), json: jest.fn() };

    // Act
    await getDocumentsByOwner(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Invalid Request,Missing Parameters" });
  });

  it("send server error response", async () => {
    // Arrange
    const req = { params: { ownerId: "123" }, user: { _id: "dfdsf", name: "asd" } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const errorMessage = "Error fetching documents";

    // Mock `docs.find` to throw an error
    docs.find.mockRejectedValueOnce(new Error(errorMessage));

    // Act
    await getDocumentsByOwner(req, res);

    // Assert
    expect(require("../middleware/logger/logger").log).toHaveBeenCalledWith(
      req,
      `Error Occured While Fetching All the Documents from user dfdsf`,
      "controllers/documents.js/getDocumentsByOwner",
      "ERR GEN",
      "ERROR" // Correct log type
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Internal Server Error" });
  });
});
