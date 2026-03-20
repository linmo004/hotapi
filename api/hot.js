const https = require('https');

const sources = {
  // 国内
  weibo:    'https://weibo.com/ajax/side/hotSearch',
  baidu:    'https://top.baidu.com/api/board?tab=realtime',
  douyin:   'https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/',
  toutiao:  'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc',
  bilibili: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all',
  hupu:     'https://bbs.hupu.com/api/v2/billboard/topic-list?boardId=1&page=1&pageSize=30',
  sspai:    'https://sspai.com/api/v1/article/index/page/get?limit=30&offset=0&include_total=true&sort=hot',
  kr36:     'https://36kr.com/api/mis/nav/home/nav/list?column=hot&siteId=1',
  weread:   'https://weread.qq.com/api/rank/newBookList?maxIdx=0&count=30',
  juejin:   'https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed?id_type=2&sort_type=3&cursor=0&limit=30',
  qqmusic:  'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?tpl=3&page=detail&type=top&topid=4&format=json',
  netease:  'https://music.163.com/api/playlist/detail?id=3778678',
  // 美国/英语圈
  reddit:      'https://www.reddit.com/hot.json?limit=30',
  hackernews:  'https://hacker-news.firebaseio.com/v0/topstories.json',
  github:      'https://github.com/trending',
  espn:        'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  billboard:   'https://www.billboard.com/charts/hot-100/',
  lastfm:      'https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=3b3d8b4e9f14c04c8f5c40e40a1a8a24&format=json&limit=30',
  bbcnews:     'https://feeds.bbci.co.uk/news/rss.xml',
  producthunt: 'https://api.producthunt.com/v2/api/graphql',
  steam:       'https://store.steampowered.com/api/featuredcategories/',
  // 日本
  yahooJP:  'https://news.yahoo.co.jp/ranking/access/news',
  niconico: 'https://nvapi.nicovideo.jp/v1/ranking/genre/all?term=24h&page=1&pageSize=30',
  // 韩国
  naver:  'https://signal.naver.com/api/ranking/realtime',
  melon:  'https://www.melon.com/chart/index.htm',
  bugs:   'https://music.bugs.co.kr/chart',
  // 其他国家
  yandex:   'https://yandex.com/news/rubric/index',
  ptt:      'https://www.ptt.cc/bbs/index.json',
  pantip:   'https://pantip.com/forum/trending',
  lemonde:  'https://www.lemonde.fr/rss/une.xml',
  spiegel:  'https://www.spiegel.de/schlagzeilen/index.rss',
  timesindia: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
};

const reqHeaders = {
  weibo:    { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://weibo.com/' },
  baidu:    { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.baidu.com/' },
  douyin:   { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.douyin.com/' },
  toutiao:  { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.toutiao.com/' },
  bilibili: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com/' },
  hupu:     { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://bbs.hupu.com/' },
  sspai:    { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://sspai.com/' },
  kr36:     { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://36kr.com/' },
  weread:   { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://weread.qq.com/' },
  juejin:   { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://juejin.cn/', 'Content-Type': 'application/json' },
  qqmusic:  { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://y.qq.com/' },
  netease:  { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://music.163.com/' },
  reddit:      { 'User-Agent': 'Mozilla/5.0 HotApi/1.0', 'Accept': 'application/json' },
  hackernews:  { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
  github:      { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
  espn:        { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
  billboard:   { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Referer': 'https://www.billboard.com/' },
  lastfm:      { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
  bbcnews:     { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml,application/xml' },
  producthunt: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Content-Type': 'application/json' },
  steam:       { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
  yahooJP:  { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Accept-Language': 'ja,en;q=0.9' },
  niconico: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Referer': 'https://www.nicovideo.jp/', 'x-frontend-id': '6', 'x-frontend-version': '0' },
  naver:  { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Accept-Language': 'ko,en;q=0.9', 'Referer': 'https://www.naver.com/' },
  melon:  { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Accept-Language': 'ko,en;q=0.9', 'Referer': 'https://www.melon.com/' },
  bugs:   { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Accept-Language': 'ko,en;q=0.9', 'Referer': 'https://music.bugs.co.kr/' },
  yandex:     { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Accept-Language': 'ru,en;q=0.9' },
  ptt:        { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Referer': 'https://www.ptt.cc/' },
  pantip:     { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Accept-Language': 'th,en;q=0.9' },
  lemonde:    { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml' },
  spiegel:    { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml' },
  timesindia: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml' },
};

const fetchUrl = (url, headers, method = 'GET', body = null, depth = 0) => {
  if (depth > 3) return Promise.reject(new Error('too many redirects'));
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: { ...headers, 'Accept': headers['Accept'] || 'application/json, text/html, */*' },
      };
      const req = https.request(options, resp => {
        if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          const next = resp.headers.location.startsWith('http')
            ? resp.headers.location
            : `https://${urlObj.hostname}${resp.headers.location}`;
          return fetchUrl(next, headers, method, body, depth + 1).then(resolve).catch(reject);
        }
        let data = '';
        resp.on('data', c => data += c);
        resp.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.setTimeout(12000, () => { req.destroy(); reject(new Error('timeout')); });
      if (body) req.write(body);
      req.end();
    } catch (e) { reject(e); }
  });
};

const fetchHNItems = async (ids) => {
  const top = ids.slice(0, 20);
  const items = await Promise.all(top.map(id =>
    fetchUrl(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, reqHeaders.hackernews)
      .then(r => JSON.parse(r)).catch(() => null)
  ));
  return items.filter(Boolean);
};

// 解析RSS XML
const parseRSS = (xml) => {
  const items = [];
  const regex = /<item[\s\S]*?<\/item>/g;
  const matches = xml.match(regex) || [];
  for (const item of matches.slice(0, 30)) {
    const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    if (titleMatch) items.push({ title: titleMatch[1].trim(), hot: '' });
  }
  return items;
};

const parseGithubHTML = (html) => {
  const items = [];
  const regex = /<h2[^>]*class="[^"]*h3[^"]*"[^>]*>\s*<a[^>]+href="\/([^"]+)"[\s\S]*?<\/a>/g;
  let match;
  const starRegex = /<span[^>]*>\s*[\s\S]*?([0-9,]+)\s*<\/span>\s*(?:stars this week|today)/g;
  const starMatches = [];
  let sm;
  while ((sm = starRegex.exec(html)) !== null) starMatches.push(sm[1].replace(/,/g, ''));
  let i = 0;
  while ((match = regex.exec(html)) !== null && items.length < 25) {
    items.push({ title: match[1].trim(), hot: starMatches[i] ? starMatches[i] + ' stars' : '' });
    i++;
  }
  if (items.length === 0) {
    const r2 = /href="\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)"/g;
    const seen = new Set();
    while ((match = r2.exec(html)) !== null && items.length < 25) {
      const t = match[1];
      if (!seen.has(t) && !t.includes('/')) { seen.add(t); items.push({ title: t, hot: '' }); }
    }
  }
  return items;
};

const parseYahooJP = (html) => {
  const items = [];
  const seen = new Set();
  const r1 = /class="[^"]*newsFeed_item_title[^"]*"[^>]*>\s*([^<]{5,})/g;
  const r2 = /<a[^>]+href="https:\/\/news\.yahoo\.co\.jp\/articles\/[^"]*"[^>]*>\s*([^<]{5,})/g;
  let m;
  for (const rx of [r1, r2]) {
    while ((m = rx.exec(html)) !== null && items.length < 25) {
      const t = m[1].trim();
      if (t && !seen.has(t)) { seen.add(t); items.push({ title: t, hot: '' }); }
    }
  }
  return items;
};

const parseMelon = (html) => {
  const items = [];
  const r = /(<span[^>]*class="[^"]*rank[^"]*"[\s\S]*?){1,2}([가-힣a-zA-Z][^<]{2,})<\/[a-z]+>/g;
  const items = [];
  const seen = new Set();
  let m;
  while ((m = r.exec(html)) !== null && items.length < 30) {
    const t = m[2].trim();
    if (t && !seen.has(t)) { seen.add(t); items.push({ title: t, hot: '' }); }
  }
  return items;
};

const parseBugs = (html) => {
  const items = [];
  const seen = new Set();
  const r = /<p[^>]*class="[^"]*title[^"]*"[^>]*>\s*<a[^>]*>([^<]{2,})<\/a>/g;
  let m;
  while ((m = r.exec(html)) !== null && items.length < 30) {
    const t = m[1].trim();
    if (t && !seen.has(t)) { seen.add(t); items.push({ title: t, hot: '' }); }
  }
  return items;
};

const parseBillboard = (html) => {
  const items = [];
  const seen = new Set();
  const r = /<h3[^>]*id="title-of-a-story"[^>]*>\s*([^<]{2,})\s*<\/h3>/g;
  let m;
  while ((m = r.exec(html)) !== null && items.length < 30) {
    const t = m[1].trim();
    if (t && !seen.has(t)) { seen.add(t); items.push({ title: t, hot: '' }); }
  }
  return items;
};

const parsePantip = (html) => {
  const items = [];
  const seen = new Set();
  const r = /class="[^"]*topic-title[^"]*"[^>]*>([^<]{5,})</g;
  let m;
  while ((m = r.exec(html)) !== null && items.length < 30) {
    const t = m[1].trim();
    if (t && !seen.has(t)) { seen.add(t); items.push({ title: t, hot: '' }); }
  }
  return items;
};

const parsePTT = (data) => {
  return (data || []).slice(0, 30).map(i => ({
    title: i.title || '',
    hot: i.nrec ? i.nrec + '推' : ''
  }));
};

const parseSteam = (d) => {
  const items = [];
  const topsellers = d?.topsellers?.items || [];
  const specials = d?.specials?.items || [];
  const newreleases = d?.new_releases?.items || [];
  const all = [...topsellers, ...specials, ...newreleases];
  const seen = new Set();
  for (const i of all) {
    if (i.name && !seen.has(i.name) && items.length < 30) {
      seen.add(i.name);
      items.push({ title: i.name, hot: i.discount_percent ? `-${i.discount_percent}%` : '' });
    }
  }
  return items;
};

const parse = async (type, raw) => {
  try {
    if (type === 'github')    return parseGithubHTML(raw);
    if (type === 'yahooJP')   return parseYahooJP(raw);
    if (type === 'melon')     return parseMelon(raw);
    if (type === 'bugs')      return parseBugs(raw);
    if (type === 'billboard') return parseBillboard(raw);
    if (type === 'pantip')    return parsePantip(raw);
    if (type === 'bbcnews' || type === 'lemonde' || type === 'spiegel' || type === 'timesindia') return parseRSS(raw);

    const d = JSON.parse(raw);

    if (type === 'weibo')    return (d.data?.realtime || []).slice(0, 30).map(i => ({ title: i.note || i.word || '', hot: i.num ? String(i.num) : '' }));
    if (type === 'baidu')    return (d.data?.cards?.[0]?.content || []).slice(0, 30).map(i => ({ title: i.word || '', hot: i.hotScore ? String(i.hotScore) : '' }));
    if (type === 'douyin')   return (d.word_list || []).slice(0, 30).map(i => ({ title: i.word || '', hot: i.hot_value ? String(i.hot_value) : '' }));
    if (type === 'toutiao')  return (d.data || []).slice(0, 30).map(i => ({ title: i.Title || '', hot: i.HotValue ? String(i.HotValue) : '' }));
    if (type === 'bilibili') return (d.data?.list || []).slice(0, 30).map(i => ({ title: i.title || '', hot: i.stat?.view ? Math.round(i.stat.view / 10000) + '万播放' : '' }));
    if (type === 'hupu')     return (d.data?.topicList || []).slice(0, 30).map(i => ({ title: i.title || '', hot: i.replies ? i.replies + '回复' : '' }));
    if (type === 'sspai')    return (d.data?.list || []).slice(0, 30).map(i => ({ title: i.title || '', hot: i.like_count ? i.like_count + '赞' : '' }));
    if (type === 'kr36')     return (d.data?.itemList || []).slice(0, 30).map(i => ({ title: i.templateMaterial?.widgetTitle || i.titleNew || '', hot: '' }));
    if (type === 'weread')   return (d.books || []).slice(0, 30).map(i => ({ title: i.bookInfo?.title || '', hot: i.readingCount ? i.readingCount + '人在读' : '' }));
    if (type === 'juejin')   return (d.data || []).slice(0, 30).map(i => ({ title: i.item_info?.article_info?.title || '', hot: i.item_info?.article_info?.digg_count ? i.item_info.article_info.digg_count + '赞' : '' }));
    if (type === 'qqmusic')  return (d.songlist || []).slice(0, 30).map(i => ({ title: `${i.songname} - ${i.singername}`, hot: '' }));
    if (type === 'netease')  return (d.result?.tracks || []).slice(0, 30).map(i => ({ title: `${i.name} - ${i.artists?.map(a => a.name).join('/')}`, hot: '' }));
    if (type === 'reddit')   return (d.data?.children || []).slice(0, 30).map(i => ({ title: i.data?.title || '', hot: i.data?.score ? i.data.score + '赞' : '' }));
    if (type === 'hackernews') {
      const items = await fetchHNItems(d);
      return items.map(i => ({ title: i.title || '', hot: i.score ? i.score + '分' : '' }));
    }
    if (type === 'espn')     return (d.events || []).slice(0, 20).map(i => ({ title: i.name || i.shortName || '', hot: i.status?.type?.description || '' }));
    if (type === 'lastfm')   return (d.tracks?.track || []).slice(0, 30).map(i => ({ title: `${i.name} - ${i.artist?.name}`, hot: i.playcount ? Number(i.playcount).toLocaleString() + '播放' : '' }));
    if (type === 'producthunt') return (d.data?.posts?.edges || []).slice(0, 20).map(i => ({ title: i.node?.name || '', hot: i.node?.votesCount ? i.node.votesCount + '票' : '' }));
    if (type === 'steam')    return parseSteam(d);
    if (type === 'niconico') return (d.data?.items || []).slice(0, 30).map(i => ({ title: i.content?.video?.title || '', hot: i.content?.video?.count?.view ? Math.round(i.content.video.count.view / 10000) + '万播放' : '' }));
    if (type === 'naver')    return (d.ranks || d.result?.ranks || []).slice(0, 30).map(i => ({ title: i.keyword || i.query || '', hot: i.rankingIndex ? '#' + i.rankingIndex : '' }));
    if (type === 'ptt')      return parsePTT(d);
    if (type === 'yandex')   return parseRSS(raw);

  } catch (e) {}
  return [];
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const type = req.query.type || 'weibo';
  const url = sources[type];
  if (!url) return res.status(400).json({ success: false, error: '不支持的平台: ' + type });

  try {
    const isPost = (type === 'juejin' || type === 'producthunt');
    const body = type === 'juejin' ? JSON.stringify({})
      : type === 'producthunt' ? JSON.stringify({ query: `{ posts(first: 20, order: VOTES) { edges { node { name tagline votesCount } } } }` })
      : null;
    const raw = await fetchUrl(url, reqHeaders[type] || {}, isPost ? 'POST' : 'GET', body);
    const list = await parse(type, raw);
    if (list && list.length > 0) {
      res.json({ success: true, data: list });
    } else {
      res.json({ success: false, data: [], error: '解析数据为空' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
