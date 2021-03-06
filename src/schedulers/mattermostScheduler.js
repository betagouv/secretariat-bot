const { CronJob } = require('cron');
const axios = require('axios').default;
const config = require('../config');

const BetaGouv = require('../lib/betagouv');
const utils = require('../utils');

const mattermostConfig = {
  headers: {
    Authorization: `Bearer ${config.mattermostBotToken}`,
  },
};

const getUserNoInTeam = async (i = 0) => {
  const mattermostUsers = await axios.get('https://mattermost.incubateur.net/api/v4/users', {
    not_in_team: config.MATTERMOST_TEAM,
    per_page: 200,
    page: i,
  }, mattermostConfig).then((response) => response.data);
  if (!mattermostUsers.length) {
    return [];
  }
  const nextPageMattermostUsers = await getUserNoInTeam(i + 1);
  return [...mattermostUsers, ...nextPageMattermostUsers];
};

const addUsersToMembresActifs = async (users) => {
  const res = await axios.post(
    `https://mattermost.incubateur.net/api/v4/teams/${config.mattermostTeamId}/members/batch`,
    users.map((user) => ({
      team_id: config.mattermostTeamId,
      user_id: user.id,
    })),
    mattermostConfig,
  ).then((response) => response.data);
  return res;
};

// get users that have github acount and matter most account that is not in team
const getUnregisteredMemberActifs = async (mattermostUsersNotInMembreActif) => {
  const users = await BetaGouv.usersInfos();
  const activeGithubUsers = users.filter((x) => {
    const stillActive = !utils.checkUserIsExpired(x);
    return stillActive;
  });
  const activeGithubUsersEmails = activeGithubUsers.map((user) => `${user.id}@${config.host}`);
  const unregisteredMemberActifs = mattermostUsersNotInMembreActif.filter(
    (user) => activeGithubUsersEmails.includes(user.email),
  );
  return unregisteredMemberActifs;
};

const addUserToTeam = async () => {
  const mattermostUsersNotInMembreActif = await getUserNoInTeam();

  const unregisteredMemberActifs = await getUnregisteredMemberActifs(mattermostUsersNotInMembreActif);
  const results = await addUsersToMembresActifs(unregisteredMemberActifs);
  return results;
};

module.exports.sendNewsletterAndCreateNewOne = new CronJob(
  '0 * * * 1-5', // every hours from Monday through Friday
  addUserToTeam,
  null,
  true,
  'Europe/Paris',
);
