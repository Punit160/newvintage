// const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
// require("dotenv").config();

// exports.generateAgora = (channel) => {
//   const role = RtcRole.PUBLISHER;
//   const expire = 3600;
//   const token = RtcTokenBuilder.buildTokenWithUid(
//     process.env.AGORA_APP_ID,
//     process.env.AGORA_APP_CERTIFICATE,
//     channel,
//     0,
//     role,
//     Math.floor(Date.now() / 1000) + expire
//   );
//   return { token, appId: process.env.AGORA_APP_ID };
// };


// const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
// require("dotenv").config();

// exports.generateAgora = (channel) => {
//   const role = RtcRole.PUBLISHER;
//   //const expire = 0.2 * 10; // 30 minutes in seconds
//    const expire = 15 * 60; // 30 minutes in seconds
//   const token = RtcTokenBuilder.buildTokenWithUid(
//     process.env.AGORA_APP_ID,
//     process.env.AGORA_APP_CERTIFICATE,
//     channel,
//     0,
//     role,
//     Math.floor(Date.now() / 1000) + expire
//   );
//   return { token, appId: process.env.AGORA_APP_ID };
// };

const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
require("dotenv").config();

// exports.generateAgora = (channel) => {
//   const role = RtcRole.PUBLISHER;
//   const expire = 15 * 60; // 15 minutes in seconds

//   const token = RtcTokenBuilder.buildTokenWithUid(
//     process.env.AGORA_APP_ID,
//     process.env.AGORA_APP_CERTIFICATE,
//     channel,
//     0, // UID 0 means dynamic UID
//     role,
//     Math.floor(Date.now() / 1000) + expire
//   );

//   return { token, appId: process.env.AGORA_APP_ID };
// };

exports.generateAgora = (channel, expireInSeconds = 30 * 60) => {
  const role = RtcRole.PUBLISHER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID,
    process.env.AGORA_APP_CERTIFICATE,
    channel,
    0,
    role,
    Math.floor(Date.now() / 1000) + expireInSeconds
  );

  return { token, appId: process.env.AGORA_APP_ID };
};

// exports.generateAgora = (channel) => {
//   const role = RtcRole.PUBLISHER;
//   const expire = 3600; // 1 hour
//   const token = RtcTokenBuilder.buildTokenWithUid(
//     process.env.AGORA_APP_ID,
//     process.env.AGORA_APP_CERTIFICATE,
//     channel,
//     0, // UID 0 = let Agora assign one
//     role,
//     Math.floor(Date.now() / 1000) + expire
//   );
//   return { token, appId: process.env.AGORA_APP_ID };
// };
