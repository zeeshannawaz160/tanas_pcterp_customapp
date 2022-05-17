// const schedule = require('node-schedule');
// const isOnline = require('is-online');
// const { employeeSync } = require('./syncMongoose');

// const rule = new schedule.RecurrenceRule();
// rule.second = [40, 30, 20];

// const job = schedule.scheduleJob(rule, async function () {
//     (async () => {
//         const isConnected = await isOnline();
//         if (isConnected) {
//             console.log("Internet is available");
//             employeeSync();

//         } else {
//             console.log("Internet connection is not avalable");

//         }
//     })();
// });

// module.exports = job;
