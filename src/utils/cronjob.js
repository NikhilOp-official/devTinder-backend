const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");
const ConnectionRequestModel = require("../models/connectionRequest");

// this job will run at 8 am in the morning every day

cron.schedule("0 8 * * *", async () => {
  // Send emails to all people who got requests the previous day
  try {
    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");
    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    for (const email of listOfEmails) {
      // Send Emails
      try {
        await sendEmail.run(
          email,
          "New Friend Requests pending for " + email,
          "Ther eare so many frined reuests pending, please login to DevTinder.in and accept or reject the request",
        );
      } catch (error) {
        console.error("Error sending email of cron");
      }
    }
  } catch (err) {
    console.error(err);
  }
});
