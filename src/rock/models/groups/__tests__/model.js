
import { Group } from "../model";
import {
  Group as GroupTable,
  GroupMember as GroupMemberTable,
} from "../tables";

import {
  Person as PersonTable
} from "../../people/tables";

jest.mock("dataloader");
jest.mock("../tables", () => ({
  Group: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
  GroupType: { model: "123" },
  GroupMember: {
    findOne: jest.fn(),
    post: jest.fn(),
  }
}));
jest.mock("../../system/tables", () => ({
  Attribute: { model: "12345" },
  AttributeValue: { model: "1234" },
}));
jest.mock("../../people/tables", () => ({
  Person: {
    fetch: jest.fn(),
  },
}));

const mockArgs = { groupId: 1234, message: "harambe", communicationPreference: "phone" };

describe("requestGroupInfo", () => {
  let groupModel;

  beforeEach(() => {
    groupModel = new Group();
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  it("should return 400 if missing info", async () => {
    const { requestGroupInfo } = groupModel;
    const res = await requestGroupInfo({});
    expect(res.code).toEqual(400);
  });

  it("should return 404 on failed group lookup", async () => {
    const { requestGroupInfo } = groupModel;
    const res = await requestGroupInfo(mockArgs, "person");
    expect(res.code).toEqual(404);
  });

  it("should lookup member with proper query and fail if found", async () => {
    const { requestGroupInfo } = groupModel;
    GroupTable.findOne.mockReturnValueOnce("hello");
    GroupMemberTable.findOne.mockReturnValueOnce("yo");

    await requestGroupInfo(mockArgs, {Id: 9999999999});
    expect(GroupMemberTable.findOne).toHaveBeenCalledWith({
      where: { GroupId: 1234, PersonId: 9999999999 },
    });
  });

  it("should return 400 if user is member of group already", async () => {
    const { requestGroupInfo } = groupModel;
    GroupTable.findOne.mockReturnValueOnce("hello");
    GroupMemberTable.findOne.mockReturnValueOnce("yo");

    const res = await requestGroupInfo(mockArgs, {Id: 9999999999});
    expect(res.code).toEqual(400);
  });

  it("should update user's communication preferences", async () => {
    const { requestGroupInfo } = groupModel;
    GroupTable.findOne.mockReturnValueOnce("hello");

    await requestGroupInfo(mockArgs, {Id: 9999999999});
    expect(PersonTable.fetch).toHaveBeenCalledWith(
      "POST",
      "attributevalue/9999999999?AttributeKey=CommunicationPreference&AttributeValue=phone",
      {}
    );
  });

  it("should return error if updating communication prefs fails", async () => {
    const { requestGroupInfo } = groupModel;
    GroupTable.findOne.mockReturnValueOnce("hello");
    PersonTable.fetch.mockReturnValueOnce({ status: 400, statusText: "ANGRY" });

    const res = await requestGroupInfo(mockArgs, {Id: 9999999999});
    expect(res).toEqual({ code: 400, error: "ANGRY", success: false});
  });

  it("should fail if adding user to group fails", async () => {
    const { requestGroupInfo } = groupModel;
    GroupTable.findOne.mockReturnValueOnce("hello");
    GroupMemberTable.post.mockReturnValueOnce({
      status: 404,
      statusText: "BAD BAD BAD",
    });

    const res = await requestGroupInfo(mockArgs, {Id: 9999999999});
    expect(res).toEqual({ code: 404, success: false, error: "BAD BAD BAD"});
  });

  it("should call post if user isn't member of group", async () => {
    const { requestGroupInfo } = groupModel;
    GroupTable.findOne.mockReturnValueOnce("hello");

    const res = await requestGroupInfo(mockArgs, {Id: 9999999999});
    expect(res).toEqual({ code: 200, success: true});
  });

  it("should return MutationResponse", async () => {
    const { requestGroupInfo } = groupModel;
    GroupTable.findOne.mockReturnValueOnce("hello");

    const res = await requestGroupInfo(mockArgs, {Id: 9999999999});
    //the bare minimum for mutation responses
    expect(Object.keys(res)).toEqual(["code", "success"]);
  });
});
