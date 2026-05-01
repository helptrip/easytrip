module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { stationName, stationId } = req.query;
  const key = process.env.BUS_KEY;
  if (!key) return res.status(500).json({ error: 'API 키 없음' });

  try {
    if (stationId) {
      const url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${key}&arsId=${encodeURIComponent(stationId)}&resultType=json`;
      const r = await fetch(url);
      const text = await r.text();
      if (text.trim().startsWith('<')) return res.status(200).json({ ok: false, buses: [] });
      const data = JSON.parse(text);
      const items = data?.msgBody?.itemList || [];
      const buses = items.map(b => ({
        busNo:   b.busRouteAbrv || b.busRouteNm || '',
        dest:    b.adirection || '',
        arrMsg1: b.arrmsg1 || '-',
        arrMsg2: b.arrmsg2 || '-',
        stId:    b.stId || stationId,
        stNm:    b.stNm || '',
        routeId: b.busRouteId || '',
      }));
      return res.status(200).json({ ok: true, buses });
    }

    if (stationName) {
      const url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByName?serviceKey=${key}&stSrch=${encodeURIComponent(stationName)}&resultType=json`;
      const r = await fetch(url);
      const text = await r.text();
      if (text.trim().startsWith('<')) return res.status(200).json({ ok: false, stations: [] });
      const data = JSON.parse(text);
      const items = data?.msgBody?.itemList || [];
      const stations = items.map(s => ({
        stId:  s.stId || '',
        arsId: s.arsId || '',
        stNm:  s.stNm || '',
        posX:  s.posX || '',
        posY:  s.posY || '',
      }));
      return res.status(200).json({ ok: true, stations });
    }

    return res.status(400).json({ error: '정류장 이름 또는 ID 필요' });

  } catch (e) {
    console.error('bus error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
