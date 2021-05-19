const isSecure = (process.env.SECURE || 'true') === 'true';

module.exports = {
	secret: process.env.SESSION_SECRET,
	secure: isSecure,
	protocol: isSecure ? 'https' : 'http',
	host: process.env.HOSTNAME,
	port: process.env.PORT || 8100,
  usersAPI: process.env.USERS_API || 'https://beta.gouv.fr/api/v2.1/authors.json',
	domain: process.env.SECRETARIAT_DOMAIN || 'beta.gouv.fr',
  mattermostBotToken: process.env.MATTERMOST_BOT_TOKEN,
  mattermostTeamId: process.env.MATTERMOST_TEAM_ID || 'testteam',
};
