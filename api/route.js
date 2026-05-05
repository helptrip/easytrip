module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { startX, startY, endX, endY } = req.query;
  if (!startX || !startY || !endX || !endY)
    return res.status(400).json({ error: '좌표 필요' });
  const key = process.env.SEOUL_ROUTE_KEY;
  if (!key) return res.status(500).json({ error: 'API 키 없음' });
  try {
    const encoded = encodeURIComponent(key);
    const url = `https://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBusNSub`
      + `?serviceKey=${encoded}`
      + `&startX=${startX}&startY=${startY}`
      + `&endX=${endX}&endY=${endY}`
      + `&resultType=json`;
    const r = await fetch(url);
    const text = await r.text();
    return res.status(200).json({ httpStatus: r.status, rawText: text.slice(0, 5000) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
