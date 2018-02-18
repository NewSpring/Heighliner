import Resolver from "../resolver";

describe("requestGroupInfo", () => {
  beforeEach(() => {});

  it("should return 401 with no person", async () => {
    const { requestGroupInfo } = Resolver.Mutation;
    const res = await requestGroupInfo(null, {}, {});
    expect(res).toEqual({
      code: 401,
      error: "Must be logged in to make this request",
      success: false,
    });
  });

  it("should call model function properly if person", async () => {
    const models = { Group: { requestGroupInfo: jest.fn() } };
    const { requestGroupInfo } = Resolver.Mutation;
    await requestGroupInfo(
      null,
      {
        communicationPreference: "banana",
        groupId: 1234,
        message: "i<br />miss<br />harambe", // should strip the br
      },
      { models, person: "person" }
    );
    expect(models.Group.requestGroupInfo).toHaveBeenCalledWith(
      {
        communicationPreference: "banana",
        groupId: 1234,
        message: "i\nmiss\nharambe",
      },
      "person"
    );
  });
});

describe("GroupSchedule", () => {
  const sampleGroup = {
    Id: 51317,
    Description: "Special Group for May 13",
    Name: "Special Group",
    WeeklyDayOfWeek: 4,
    WeeklyTimeOfDay: "1970-01-01T16:00:00.000Z",
  };

  it("passes date and time correctly", () => {
    const { GroupSchedule } = Resolver;
    const description = GroupSchedule.description(sampleGroup);
    expect(description).toEqual("Thursday @ 4:00 PM");
  });

  it("handles sunday correctly", () => {
    const { GroupSchedule } = Resolver;
    const sundayGroup = sampleGroup;
    sundayGroup.WeeklyDayOfWeek = 0;
    const description = GroupSchedule.description(sundayGroup);
    expect(description).toEqual("Sunday @ 4:00 PM");
  });

  it("should show day even if no time", () => {
    const { GroupSchedule } = Resolver;
    const group = { ...sampleGroup, WeeklyTimeOfDay: null };
    const description = GroupSchedule.description(group);
    expect(description).toEqual("Sunday");
  });

  it("should show date and time for ical", () => {
    const { GroupSchedule } = Resolver;
    const days = [
      { label: "SU", day: "Sunday" },
      { label: "MO", day: "Monday" },
      { label: "TU", day: "Tuesday" },
      { label: "WE", day: "Wednesday" },
      { label: "TH", day: "Thursday" },
      { label: "FR", day: "Friday" },
      { label: "SA", day: "Saturday" },
    ];

    days.map(day => {
      const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ddaysoftware.com//NONSGML DDay.iCal 1.0//EN
BEGIN:VEVENT
DTEND:20160825T193001
DTSTAMP:20170222T201103Z
DTSTART:20160825T193000
RRULE:FREQ=WEEKLY;BYDAY=${day.label}
SEQUENCE:0
UID:3203aa08-221f-42dc-8b63-56270ede5794
END:VEVENT
END:VCALENDAR`;
      const group = {
        ...sampleGroup,
        WeeklyDayOfWeek: null,
        iCalendarContent: ical,
      };
      const description = GroupSchedule.description(group);
      expect(description).toEqual(`${day.day} @ 7:30 PM`);
    });
  });

  it("should allow multiple days in ical", () => {
    const { GroupSchedule } = Resolver;
    const days = [
      { label: "SU,MO,WE,SA", day: "Sunday, Monday, Wednesday, Saturday" },
      { label: "TH,WE,SU", day: "Thursday, Wednesday, Sunday" },
      { label: "MO,SU", day: "Monday, Sunday" },
    ];

    days.map(day => {
      const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ddaysoftware.com//NONSGML DDay.iCal 1.0//EN
BEGIN:VEVENT
DTEND:20160825T193001
DTSTAMP:20170222T201103Z
DTSTART:20160825T193000
RRULE:FREQ=WEEKLY;BYDAY=${day.label}
SEQUENCE:0
UID:3203aa08-221f-42dc-8b63-56270ede5794
END:VEVENT
END:VCALENDAR`;
      const group = {
        ...sampleGroup,
        WeeklyDayOfWeek: null,
        iCalendarContent: ical,
      };
      const description = GroupSchedule.description(group);
      expect(description).toEqual(`${day.day} @ 7:30 PM`);
    });
  });
});
