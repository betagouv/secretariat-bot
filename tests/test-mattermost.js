const rewire = require('rewire');
const nock = require('nock');
const sinon = require('sinon');
const utils = require('../src/utils.js');
const testUsers = require('./users.json');
const config = require('../src/config');

const mattermostUsers = [
  {
    id: 'membre.actif',
    email: `membre.actif@${config.host}`,
  },
  {
    id: 'julien.dauphant',
    email: `julien.dauphant@${config.host}`,
  },
  {
    id: 'thomas.guillet',
    email: `thomas.guillet@${config.host}`,
  },
  {
    id: 'countdoesnotexist',
    email: `countdoesnotexist@${config.host}`,
  },
];

const mattermostScheduler = rewire('../src/schedulers/mattermostScheduler');

describe('Add mattermost user to team', () => {
  let clock;
  beforeEach(async () => {
    const date = new Date('2021-01-20T07:59:59+01:00');
    clock = sinon.useFakeTimers(date);
    nock.cleanAll();
    nock.enableNetConnect();
  });

  afterEach(async () => {
    clock.restore();
  });

  it('Add user to team', async () => {
    nock(/.*mattermost.incubateur.net/)
    .get(/^.*api\/v4\/users.*/)
    .reply(200, [...mattermostUsers]);
    nock(/.*mattermost.incubateur.net/)
    .get(/^.*api\/v4\/users.*/)
    .reply(200, []);

    const postBatchMock = nock(/.*mattermost.incubateur.net/)
    .post(/^.*api\/v4\/teams\/testteam\/members\/batch.*/)
    .reply(200, [{}, {}]).persist();

    const url = process.env.USERS_API || 'https://beta.gouv.fr';
    nock(url)
    .get((uri) => uri.includes('authors.json'))
    .reply(200, testUsers)
    .persist();
    const addUserToTeam = mattermostScheduler.__get__('addUserToTeam');
    const result = await addUserToTeam([...mattermostUsers]);
    result.length.should.be.equal(2);
  });
});
