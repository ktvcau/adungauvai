const config = {
  name: "kit",
  usage: "kitt <ID>",
  aliases: ["kit", "kicktag"],
  description: "Kick Rồi Tag Liên Tục",
  credits: "XIE"
};

function kick(userID, threadID) {
  return new Promise((resolve, reject) => {
    global.api.removeUserFromGroup(userID, threadID, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function add(userID, threadID) {
  return new Promise((resolve, reject) => {
    global.api.addUserToGroup(userID, threadID, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function getUserName(userID) {
  return new Promise((resolve, reject) => {
    global.api.getUserInfo(userID, (err, info) => {
      if (err) return reject(err);
      const userName = info[userID]?.name || `@${userID}`;
      resolve(userName);
    });
  });
}

async function onCall({ message, data, args }) {
  if (!message.isGroup) return;
  const { threadID, messageReply, reply } = message;
  try {
    const targetID = args[0] || (messageReply && messageReply.senderID);

    if (!targetID) return reply("Thiếu mục tiêu");

    const threadInfo = data.thread.info;
    const { adminIDs } = threadInfo;

    const isFacebookID = /^\d+$/.test(targetID);

    if (!isFacebookID)
      return reply("ID người dùng không hợp lệ.");

    while (true) {
      const targetName = await getUserName(targetID);

      await reply({ body: `Cha kick ${targetName} nè`, mentions: [{ tag: targetName, id: targetID }] });
      await kick(targetID, threadID);
      await reply({ body: `Ú con chó ${targetName} được cha thêm vào rồi nè.`, mentions: [{ tag: targetName, id: targetID }] });
      await add(targetID, threadID);
      await global.sleep(500);

      let isStop = args[1]?.toLowerCase() === "stop";
      if (isStop) {
        message.send("Đã dừng chọc tức.");
        break;
      }
    }
  } catch (e) {
    console.error(e);
    reply("Lỗi");
  }
}

export default {
  config,
  onCall
};
