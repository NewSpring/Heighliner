/* tslint:disable:no-shadowed-variable */

import { INTEGER, STRING, BOOLEAN, DATE } from "sequelize";

import { MSSQLConnector } from "../../mssql";

const groupSchema = {
  Id: { type: INTEGER, primaryKey: true },
  Guid: { type: STRING },
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

const groupTypeSchema = {
  Id: { type: INTEGER, primaryKey: true },
  Name: { type: STRING },
};

const groupMemberSchema = {
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

const groupTypeRoleSchema = {
  Id: { type: INTEGER, primaryKey: true },
  Name: { type: STRING },
};

const groupLocationSchema = {
  Id: { type: INTEGER, primaryKey: true },
  GroupId: { type: INTEGER },
  GroupLocationTypeValueId: { type: INTEGER },
  GroupMemberPersonAliasId: { type: INTEGER },
  LocationId: { type: INTEGER },
};

// XXX abstract
const scheduleSchema = {
  Id: { type: INTEGER, primaryKey: true },
  Description: { type: STRING },
  Name: { type: STRING },
  WeeklyDayOfWeek: { type: INTEGER },
  WeeklyTimeOfDay: { type: INTEGER },
  EffectiveEndDate: { type: DATE },
  EffectiveStartDate: { type: DATE },
  iCalendarContent: { type: STRING },
};

let Group;
let GroupType;
let GroupTypeRole;
let GroupMember;
let GroupLocation;

// XXX abstract
let Schedule;
export {
  Group,
  groupSchema,
  GroupType,
  groupTypeSchema,
  GroupTypeRole,
  groupTypeRoleSchema,
  GroupMember,
  groupMemberSchema,
  GroupLocation,
  groupLocationSchema,
  // XXX abstract
  Schedule,
  scheduleSchema,
};

export function connect() {
  Group = new MSSQLConnector("Group", groupSchema);
  GroupMember = new MSSQLConnector("GroupMember", groupMemberSchema);
  GroupLocation = new MSSQLConnector("GroupLocation", groupLocationSchema);
  GroupType = new MSSQLConnector("GroupType", groupTypeSchema);
  GroupTypeRole = new MSSQLConnector("GroupTypeRole", groupTypeRoleSchema);

  // XXX abstract
  Schedule = new MSSQLConnector("Schedule", scheduleSchema);

  return {
    Group,
    GroupMember,
    GroupLocation,
    GroupType,
    GroupTypeRole,
  };
}

export function bind(
  {
    Group,
    GroupType,
    GroupTypeRole,
    GroupMember,
    Campus,
    AttributeValue,
    GroupLocation,
    Location,
    Person,
  },
) {
  Group.model.hasMany(GroupMember.model, { foreignKey: "GroupId" });
  Group.model.belongsTo(Campus.model, {
    foreignKey: "CampusId",
    targetKey: "Id",
  });
  Group.model.hasMany(GroupLocation.model, { foreignKey: "GroupId" });

  GroupMember.model.belongsTo(Group.model, {
    foreignKey: "GroupId",
    targetKey: "Id",
  });
  GroupLocation.model.belongsTo(Group.model, {
    foreignKey: "GroupId",
    targetKey: "Id",
  });

  GroupMember.model.belongsTo(Person.model, {
    foreignKey: "PersonId",
    targetKey: "Id",
  });
  Person.model.hasMany(GroupMember.model, { foreignKey: "PersonId" });

  GroupLocation.model.belongsTo(Location.model, {
    foreignKey: "LocationId",
    targetKey: "Id",
  });

  Group.model.belongsTo(GroupType.model, {
    foreignKey: "GroupTypeId",
    targetKey: "Id",
  });
  AttributeValue.model.belongsTo(Group.model, {
    foreignKey: "EntityId",
    targetKey: "Id",
  });

  Group.model.hasMany(AttributeValue.model, { foreignKey: "EntityId" });

  GroupMember.model.belongsTo(GroupTypeRole.model, {
    foreignKey: "GroupRoleId",
    targetKey: "Id",
  });
}

export default {
  connect,
  bind,
};
