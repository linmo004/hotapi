const https = require('https');

const sources = {
  weibo: 'https://weibo.com/ajax/side/hotSearch',
  baidu: 'https://top.baidu.com/api/board?tab=realtime',
  douyin: 'https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/',
  toutiao: 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc',
  bilibili: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all',
  reddit: 'https://www.reddit.com/hot.json?limit=30',
  hackernews: 'https://hacker-news.firebaseio.com/v0/topstories.json',
  github: 'https://api.github.com/search/repositories?q=stars:%3E1000&sort=stars&order=desc&per_page=30',
  espn: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news',
  lastfm: 'https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=3a5a9e1d5c09e35b8c2e26e91bc0e6f3&format=json&limit=30',
  niconico: 'https://nvapi.nicovideo.jp/v1/ranking/genre/all?term=24h&page=1&pageSize=30',
  naver: 'https://signal.naver.com/api/ranking/realtime',
};

const reqHeaders = {
  weibo: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://weibo.com/' },
  baidu: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.baidu.com/' },
  douyin: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.douyin.com/' },
  toutiao: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.toutiao.com/' },
  bilibili: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com/' },
  reddit: { 'User-Agent': 'Mozilla/5.0 HotApi/1.0' },
  hackernews: { 'User-Agent': 'Mozilla/5.0' },
  github: { 'User-Agent': 'HotApi/1.0', 'Accept': 'application/vnd.github.v3+json' },
  espn: { 'User-Agent': 'Mozilla/5.0' },
  lastfm: { 'User-Agent': 'Mozilla/5.0' },
  niconico: { 'User-Agent': 'Mozilla/5.0', 'x-frontend-id': '6', 'x-frontend-version': '0' },
  naver: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ko,en;q=0.9' },
};

const fetchUrl = (url, headers) => new Promise((resolve, reject) => {
  const u = new URL(url);
  const req = https.request(
    { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers },
    res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://${u.hostname}${res.headers.location}`;
        return fetchUrl(next, headers).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    }
  );
  req.on('error', reject);
  req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  req.end();
});

const parse = (type, raw) => {
  const d = JSON.parse(raw);
  if (type === 'weibo') return (d.data?.realtime || []).slice(0,30).map(i => ({ title: i.note || i.word || '', hot: i.num ? String(i.num) : '' }));
  if (type === 'baidu') return (d.data?.cards?.[0]?.content || []).slice(0,30).map(i => ({ title: i.word || '', hot: i.hotScore ? String(i.hotScore) : '' }));
  if (type === 'douyin') return (d.word_list || []).slice(0,30).map(i => ({ title: i.word || '', hot: i.hot_value ? String(i.hot_value) : '' }));
  if (type === 'toutiao') return (d.data || []).slice(0,30).map(i => ({ title: i.Title || '', hot: i.HotValue ? String(i.HotValue) : '' }));
  if (type === 'bilibili') return (d.data?.list || []).slice(0,30).map(i => ({ title: i.title || '', hot: i.stat?.view ? Math.round(i.stat.view/10000)+'万' : '' }));
  if (type === 'reddit') return (d.data?.children || []).slice(0,30).map(i => ({ title: i.data?.title || '', hot: i.data?.score ? i.data.score+'赞' : '' }));
  if (type === 'hackernews') return (d || []).slice(0,20).map(id => ({ title: String(id), hot: '' }));
  if (type === 'github') return (d.items || []).slice(0,30).map(i => ({ title: i.full_name || '', hot: i.stargazers_count ? i.stargazers_count+'⭐' : '' }));
  if (type === 'espn') return (d.articles || []).slice(0,30).map(i => ({ title: i.headline || '', hot: i.type || '' }));
  if (type === 'lastfm') return (d.tracks?.track || []).slice(0,30).map(i => ({ title: (i.name||'') + (i.artist?.name ? ' - '+i.artist.name : ''), hot: i.playcount ? i.playcount+'次' : '' }));
  if (type === 'niconico') return (d.data?.items || []).slice(0,30).map(i => ({ title: i.content?.video?.title || '', hot: i.content?.video?.count?.view ? Math.round(i.content.video.count.view/10000)+'万' : '' }));
  if (type === 'naver') return (d.ranks || d.result?.ranks || []).slice(0,30).map(i => ({ title: i.keyword || '', hot: i.rankingIndex ? '#'+i.rankingIndex : '' }));
  return [];
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const type = req.query.type || 'weibo';
  if (!sources[type]) {
    return res.status(400).json({ success: false, error: '不支持: ' + type });
  }

  try {
    const raw = await fetchUrl(sources[type], reqHeaders[type] || {});
    const list = parse(type, raw);
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
