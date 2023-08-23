const metaJson = {
  name: "CalendarType",
  title: " Calendar Type",
  type: "LIST",
  placeHolder: "Select Calendar type",
  validationRegEx: "",
  required: false,
  visible: true,
  disable: false,
  multiSelect: false,
  values: [
    {
      id: "MyCalendar",
      value: "My Calendar",
    },
    {
      id: "ResidentCalendar",
      value: "Resident Calendar",
    },
    {
      id: "CommunityCalendar",
      value: "Community Calendar",
    },
  ],
  canUpdate: true,
  audit: true,
};
// {
//     "name": "calenderType",
//     "title": "",
//     "type": "PAIREDLIST",
//     "visible": false,
//     "disable": false,
//     "required": false,
//     "visibleOnCsv": false,
//     "info": "Select calender Type & categories",
//     "labels": {
//         "title": "Calender Type",
//         "name": "calenderType",
//         "placeHolder": "Select calender Type",
//         "child": {
//             "title": "Categories",
//             "name": "categories",
//             "placeHolder": "Select categories"
//         }
//     },
//     "values": [
//         {
//             "name": "My Calendar",
//             "id": "MyCalendar",
//             "child": [
//                 // {
//                 //     "name": "All",
//                 //     "id": "All"
//                 // },
//                 {
//                     "name": "Training",
//                     "id": "Training"
//                 },
//                 {
//                     "name": "Meetings",
//                     "id": "Meetings"
//                 },
//                 {
//                     "name": "Tasks",
//                     "id": "Tasks"
//                 },
//                 {
//                     "name": "Reminders",
//                     "id": "Reminders"
//                 },
//             ]
//         },
//         {
//             "name": "Resident Calendar",
//             "id": "ResidentCalendar",
//             "child": [
//                 // {
//                 //     "name": "All",
//                 //     "id": "All"
//                 // },
//                 {
//                     "name": "Daily Car Log",
//                     "id": "Daily Car Log"
//                 },
//                 {
//                     "name": "eMAr",
//                     "id": "eMAr"
//                 },
//                 {
//                     "name": "Birthdays",
//                     "id": "Birthdays"
//                 },
//                 {
//                     "name": "Reminders",
//                     "id": "Reminders"
//                 },
//                 {
//                     "name": "Activities",
//                     "id": "Activities"
//                 },
//             ]
//         },
//         {
//             "name": "community Calendar",
//             "id": "communityCalendar",
//             "child": [
//                 {
//                     "name": "Training",
//                     "id": "Training"
//                 },
//                 {
//                     "name": "Meetings",
//                     "id": "Meetings"
//                 },
//                 {
//                     "name": "Holidays",
//                     "id": "Holidays"
//                 },
//                 {
//                     "name": "Activities",
//                     "id": "Activities"
//                 }
//             ]
//         }
//     ],
//     "canUpdate": true,
//     "audit": true
// }

export default metaJson;
