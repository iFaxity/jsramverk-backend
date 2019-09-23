const MarkdownIt = require('markdown-it');
const Auth = require('../lib/auth');
const Report = require('../lib/report');
const router = require('@koa/router')();
const markdown = new MarkdownIt();

const HOME_TEXT = markdown.render(`
Hej, jag heter Christian Norrman och bor i Åhus, Skåne ungefär 1,7 mil utanför Kristianstad.
Har bott här i princip hela mitt liv tills jag började plugga Datorsäkerhet på BTH i Karlskrona 2016 på höstterminen.
Men efter första terminen så insåg jag att jag hade valt fel och ville istället plugga webbutveckling.
Distansutbildining verkade bra för mig så jag sökte till olika webbprogrammerarlinjer men kom inte in förrens nu.

Första gången jag programmerade var på NTI-Gymnasiet i Kristianstad.
Jag fick snabbt ett stort intresse av programmering och blev snabbt bättre än programmerings lärarna.
Innan dess använde jag bara min dator för att spela datorspel och surfa på internet, kunde i princip like mycket om datorer som en vanlig svensson.

Vi syns säkert i forumet eller i chatten ibland!
`);


/* GET home page. */
router.get('/', ctx => {
  ctx.body = {
    status: 200,
    data: {
      content: HOME_TEXT,
    },
  }
});

/* Routes for reports. */
router.get('/reports/week/:id', async ctx => {
  const report = await Report.read(ctx.params.id);

  if (report) {
    report.content = markdown.render(report.content);

    ctx.body = {
      status: 200,
      data: report,
    };
  }
});
router.get('/reports/week/:id/edit', Auth.middleware, async ctx => {
  const report = await Report.read(ctx.params.id);

  if (report) {
    ctx.body = {
      status: 200,
      data: report,
    };
  }
});
router.get('/reports', async ctx => {
  const reports = await Report.list();

  ctx.body = {
    status: 200,
    data: reports,
  }
});
router.post('/reports', Auth.middleware, async ctx => {
  let { id, content } = ctx.request.body;
  let message;

  const report = await Report.read(id);

  if (!report) {
    await Report.create({ id, content });
    message = 'Rapporten skapades';
  } else {
    await Report.update({ id, content });
    message = 'Rapporten uppdaterades';
  }

  ctx.body = {
    status: 200,
    message,
  };
});

/* Authentication routes. */
router.post('/register', async ctx => {
  const { email, name, password, birthdate } = ctx.request.body;
  await Auth.register({ email, name, password, birthdate });

  ctx.body = {
    status: 200,
    message: 'Användaren skapades',
  };
});
router.post('/login', async ctx => {
  const { email, password } = ctx.request.body;
  const token = await Auth.login(email, password);

  ctx.body = {
    status: 200,
    message: 'Inloggning lyckades',
    token,
  };
});

module.exports = router;
