// betagouv.js
// ======
const axios = require('axios').default;
const config = require('../config');

const betaGouv = {
  usersInfos: async () => axios.get(config.usersAPI).then((response) => response.data.map((author) => {
    if (author.missions && author.missions.length > 0) {
      const sortedStartDates = author.missions.map((x) => x.start).sort();
      const sortedEndDates = author.missions.map((x) => x.end || '').sort().reverse();
      const latestMission = author.missions.reduce((a, v) => (v.end > a.end || !v.end ? v : a));

      [author.start] = sortedStartDates;
      author.end = sortedEndDates.includes('') ? '' : sortedEndDates[0];
      author.employer = latestMission.status ? `${latestMission.status}/${latestMission.employer}` : latestMission.employer;
    }
    return author;
  })).catch((err) => {
    throw new Error(`Error to get users infos in ${config.domain}: ${err}`);
  }),
  userInfosById: async (id) => {
    const users = await betaGouv.usersInfos();
    return users.find((user) => user.id === id);
  },
};

module.exports = { ...betaGouv };
