'use strict';
const {WebClient} = require('@slack/client');
const pgDb = require('../lib/db-postgres');

function sendMessage(webClient, channel, message) {
  return new Promise((resolve, reject) => {
    webClient.chat.postMessage(channel, message, {
      as_user: true,
      link_names: true
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function getChannels(webClient) {
  return new Promise((resolve, reject) => {
    webClient.channels.list({
      exclude_archived: true,
      exclude_members: true
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.channels);
      }
    });
  });
}

function getPrivateChannels(webClient) {
  return new Promise((resolve, reject) => {
    webClient.groups.list({
      exclude_archived: true,
      exclude_members: true
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.groups);
      }
    })
  });
}

function generateDinnerOption() {
  return pgDb.task(task => {
    return task.one('SELECT * FROM get_random_dinner()');
  });
}

function generateMessage(dinner) {
  return `Dinner for today is ${dinner.name}`;
}

async function postMessage() {
  const webClient = new WebClient(process.env.SLACK_API_TOKEN);
  const [publicChannels, privateChannels] = await Promise.all([
    getChannels(webClient),
    getPrivateChannels(webClient)
  ]);
  const memberChannels = publicChannels.filter(
    publicChannel => publicChannel.is_member
  );
  memberChannels.push(...privateChannels);
  const dinner = await generateDinnerOption();
  const message = generateMessage(dinner);
  await Promise.all(
    memberChannels.map(memberChannel => sendMessage(
      webClient,
      memberChannel.id,
      message
    ))
  );
}

postMessage()
  .catch(err => console.error(err));