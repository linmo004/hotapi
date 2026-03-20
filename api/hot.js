const https = require('https');

const LASTFM_KEY = '3b19200f4a3b2b8198d6258600238dc1';

const sources = {
  weibo:         'https://weibo.com/ajax/side/hotSearch',
  baidu:         'https://top.baidu.com/api/board?tab=realtime',
  douyin:        'https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/',
  toutiao:       'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc',
  bilibili:      'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all',
  espn:          'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=20',
  lastfm:        `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${LASTFM_KEY}&format=json&limit=30`,
  lastfm_artist: `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${LASTFM_KEY}&format=json&limit=30`,
  lastfm_tag:    `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=kpop&api_key=${LASTFM_KEY}&format=json&limit=30`,
};

const reqHeaders = {
  weibo:         { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://weibo.com/' },
  baidu:         { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.baidu.com/' },
  douyin:        { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.douyin.com/' },
  toutiao:       { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.toutiao.com/' },
  bilibili:      { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com/' },
  espn:          { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
  lastfm:        { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
  lastfm_artist: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
  lastfm_tag:    { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
};

const fetchUrl = (url, headers, redirectCount = 0) => new Promise((resolve, reject) => {
  if (redirectCount > 5) return reject(new Error('too many redirects'));
  try {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers },
      res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : `https://${u.hostname}${res.headers.location}`;
          return fetchUrl(next, headers, redirectCount + 1).then(resolve).catch(reject);
        }
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  } catch (e) { reject(e); }
});

const fetchHNStories = async () => {
  const { body } = await fetchUrl(
    'https://hacker-news.firebaseio.com/v0/topstories.json',
    { 'User-Agent': 'Mozilla/5.0' }
  );
  const ids = JSON.parse(body).slice(0, 20);
  const stories = await Promise.all(
    ids.map(id =>
      fetchUrl(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        { 'User-Agent': 'Mozilla/5.0' }
      ).then(r => JSON.parse(r.body)).catch(() => null)
    )
  );
  return stories.filter(Boolean).map(s => ({
    title: s.title || '',
    hot: s.score ? s.score + '分' : '',
    url: s.url || `https://news.ycombinator.com/item?id=${s.id}`
  }));
};

const parse = (type, body) => {
  const d = JSON.parse(body);
  if (type === 'weibo')         return (d.data?.realtime || []).slice(0,30).map(i => ({ title: i.note || i.word || '', hot: i.num ? String(i.num) : '' }));
  if (type === 'baidu')         return (d.data?.cards?.[0]?.content || []).slice(0,30).map(i => ({ title: i.word || '', hot: i.hotScore ? String(i.hotScore) : '' }));
  if (type === 'douyin')        return (d.word_list || []).slice(0,30).map(i => ({ title: i.word || '', hot: i.hot_value ? String(i.hot_value) : '' }));
  if (type === 'toutiao')       return (d.data || []).slice(0,30).map(i => ({ title: i.Title || '', hot: i.HotValue ? String(i.HotValue) : '' }));
  if (type === 'bilibili')      return (d.data?.list || []).slice(0,30).map(i => ({ title: i.title || '', hot: i.stat?.view ? Math.round(i.stat.view/10000)+'万' : '' }));
  if (type === 'espn')          return (d.articles || []).slice(0,20).map(i => ({ title: i.headline || '', hot: i.categories?.[0]?.description || '' }));
  if (type === 'lastfm')        return (d.tracks?.track || []).slice(0,30).map(i => ({ title: (i.name||'') + (i.artist?.name ? ' - '+i.artist.name : ''), hot: i.playcount ? Number(i.playcount).toLocaleString()+'次' : '' }));
  if (type === 'lastfm_artist') return (d.artists?.artist || []).slice(0,30).map(i => ({ title: i.name || '', hot: i.playcount ? Number(i.playcount).toLocaleString()+'次' : '' }));
  if (type === 'lastfm_tag')    return (d.tracks?.track || []).slice(0,30).map(i => ({ title: (i.name||'') + (i.artist?.name ? ' - '+i.artist.name : ''), hot: i.playcount ? Number(i.playcount).toLocaleString()+'次' : '' }));
  return [];
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const type = req.query.type || 'weibo';

  try {
    let list = [];
    if (type === 'hackernews') {
      list = await fetchHNStories();
    } else if (sources[type]) {
      const { status, body } = await fetchUrl(sources[type], reqHeaders[type] || {});
      if (status !== 200) throw new Error(`上游返回 HTTP ${status}`);
      list = parse(type, body);
    } else {
      return res.status(400).json({ success: false, error: '不支持的平台: ' + type });
    }

    if (list.length > 0) {
      res.json({ success: true, data: list });
    } else {
      res.json({ success: false, data: [], error: '解析结果为空' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
