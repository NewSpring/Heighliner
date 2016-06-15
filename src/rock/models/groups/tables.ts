/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
  BOOLEAN,
  DATE,
} from "sequelize";

import { MSSQLConnector, Tables } from "../../mssql";

const groupSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  CampusId: { type: INTEGER },
  Description: { type: STRING },
  GroupTypeId: { type: INTEGER },
  IsActive: { type: BOOLEAN },
  IsPublic: { type: BOOLEAN },
  IsSecurityRole: { type: BOOLEAN },
  IsSystem: { type: BOOLEAN },
  MustMeetRequirementsToAddMember: { type: BOOLEAN },
  Name: { type: STRING },
  ParentGroupId: { type: INTEGER },
  ScheduleId: { type: INTEGER },
};

const groupMemberSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  DateTimeAdded: { type: DATE },
  GroupId: { type: INTEGER },
  GroupMemberStatus: { type: STRING },
  GroupRoleId: { type: INTEGER },
  GuestCount: { type: INTEGER },
  IsNotified: { type: BOOLEAN },
  IsSystem: { type: BOOLEAN },
  Note: { type: STRING },
  PersonId: { type: INTEGER },
};

const groupLocationSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  GroupId: { type: INTEGER },
  GroupLocationTypeValueId: { type: INTEGER },
  GroupMemberPersonAliasId: { type: INTEGER },
  LocationId: { type: INTEGER },
};

let Group;
let GroupMember;
let GroupLocation;
export {
  Group,
  groupSchema,

  GroupMember,
  groupMemberSchema,

  GroupLocation,
  groupLocationSchema,
};

export function connect(): Tables {
  Group = new MSSQLConnector("Group", groupSchema);
  GroupMember = new MSSQLConnector("GroupMember", groupMemberSchema);
  GroupLocation = new MSSQLConnector("GroupLocation", groupLocationSchema);

  return {
    Group,
    GroupMember,
    GroupLocation,
  };
};

export function bind({
  Group,
  GroupMember,
  Campus,
  GroupLocation,
  Location,
}: Tables): void {

  Group.model.hasMany(GroupMember.model, { foreignKey: "GroupId" });
  Group.model.belongsTo(Campus.model, { foreignKey: "CampusId", targetKey: "Id" });

  GroupMember.model.belongsTo(Group.model, { foreignKey: "GroupId", targetKey: "Id" });
  GroupLocation.model.belongsTo(Group.model, { foreignKey: "GroupId", targetKey: "Id" });

  GroupLocation.model.belongsTo(Location.model, { foreignKey: "LocationId", targetKey: "Id" });

};

export default {
  connect,
  bind,
};
