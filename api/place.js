module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { query, x, y } = req.query;
  if (!query) return res.status(400).json({ error: '검색어 필요' });

  const key = process.env.KAKAO_KEY;
  if (!key) return res.status(500).json({ error: 'API 키 없음' });

  try {
    let url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
    if (x && y) url += `&x=${x}&y=${y}&sort=distance`;

    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` }
    });

    if (!r.ok) throw new Error(`Kakao API HTTP ${r.status}`);

    const data = await r.json();
    const places = (data.documents || []).map(p => ({
      name:     p.place_name,
      address:  p.road_address_name || p.address_name,
      category: p.category_name,
      phone:    p.phone,
      lng:      parseFloat(p.x),
      lat:      parseFloat(p.y),
      distance: p.distance || '',
      url:      p.place_url,
    }));

    return res.status(200).json({ ok: true, places, total: data.meta?.total_count || 0 });

  } catch (e) {
    console.error('place error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
