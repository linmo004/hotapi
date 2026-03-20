const https = require('https');

const sources = {
  weibo: 'https://weibo.com/ajax/side/hotSearch',
  zhihu: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50',
  baidu: 'https://top.baidu.com/api/board?tab=realtime',
  douyin: 'https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/',
  toutiao: 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc',
};

const headers = {
  weibo: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://weibo.com/' },
  zhihu: { 'User-Agent': 'Mozilla/5.0', 'cookie': '' },
  baidu: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.baidu.com/' },
  douyin: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.douyin.com/' },
  toutiao: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.toutiao.com/' },
};

const parse = (type, raw) => {
  try {
    const d = JSON.parse(raw);
    if (type === 'weibo') {
      return (d.data?.realtime || []).slice(0, 30).map(i => ({ title: i.note || i.word, hot: i.num ? i.num + '' : '' }));
    }
    if (type === 'zhihu') {
      return (d.data || []).slice(0, 30).map(i => ({ title: i.target?.title || '', hot: i.detail_text || '' }));
    }
    if (type === 'baidu') {
      return (d.data?.cards?.[0]?.content || []).slice(0, 30).map(i => ({ title: i.word, hot: i.hotScore ? i.hotScore + '' : '' }));
    }
    if (type === 'douyin') {
      return (d.word_list || []).slice(0, 30).map(i => ({ title: i.word, hot: i.hot_value ? i.hot_value + '' : '' }));
    }
    if (type === 'toutiao') {
      return (d.data || []).slice(0, 30).map(i => ({ title: i.Title, hot: i.HotValue ? i.HotValue + '' : '' }));
    }
  } catch (e) {}
  return [];
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  const type = req.query.type || 'weibo';
  const url = sources[type];
  if (!url) return res.status(400).json({ error: 'unknown type' });
  try {
    const data = await new Promise((resolve, reject) => {
      const r = https.get(url, { headers: headers[type] }, resp => {
        let body = '';
        resp.on('data', c => body += c);
        resp.on('end', () => resolve(body));
      });
      r.on('error', reject);
      r.setTimeout(8000, () => { r.destroy(); reject(new Error('timeout')); });
    });
    const list = parse(type, data);
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
