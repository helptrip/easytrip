export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { stationName, stationId } = req.query;
  const key = process.env.BUS_KEY;
  if (!key) return res.status(500).json({ error: 'API 키 없음' });

  try {
    // ── 1. stationId 있으면 바로 도착정보 조회 ──
    if (stationId) {
      const url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid` +
        `?serviceKey=${key}&arsId=${encodeURIComponent(stationId)}&resultType=json`;
      const r = await fetch(url);
      const data = await r.json();
      const items = data?.msgBody?.itemList || [];
      const buses = items.map(b => ({
        busNo:    b.busRouteAbrv || b.busRouteNm || '',
        dest:     b.adirection || '',
        arrMsg1:  b.arrmsg1 || '-',   // 첫번째 버스 도착 메시지
        arrMsg2:  b.arrmsg2 || '-',   // 두번째 버스 도착 메시지
        stId:     b.stId || stationId,
        stNm:     b.stNm || '',
        routeId:  b.busRouteId || '',
      }));
      return res.status(200).json({ ok: true, buses, raw: data });
    }

    // ── 2. 정류장 이름으로 검색 → 정류장 목록 반환 ──
    if (stationName) {
      const encoded = encodeURIComponent(stationName);
      const url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByName` +
        `?serviceKey=${key}&stSrch=${encoded}&resultType=json`;
      const r = await fetch(url);
      const data = await r.json();
      const items = data?.msgBody?.itemList || [];
      const stations = items.map(s => ({
        stId:   s.stId || '',
        arsId:  s.arsId || '',   // 정류장 번호 (5자리)
        stNm:   s.stNm || '',
        posX:   s.posX || '',
        posY:   s.posY || '',
      }));
      return res.status(200).json({ ok: true, stations, raw: data });
    }

    return res.status(400).json({ error: '정류장 이름 또는 ID 필요' });

  } catch (e) {
    console.error('bus error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
