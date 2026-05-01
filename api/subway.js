module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { station } = req.query;
  if (!station) return res.status(400).json({ error: '역 이름 필요' });

  const key = process.env.SUBWAY_KEY;
  if (!key) return res.status(500).json({ error: 'API 키 없음' });

  try {
    const encoded = encodeURIComponent(station);
    const url = `http://swopenAPI.seoul.go.kr/api/subway/${key}/json/realtimeStationArrival/0/10/${encoded}`;
    const response = await fetch(url);
    const text = await response.text();

    // HTML 응답이면 API 키 오류
    if (text.trim().startsWith('<')) {
      return res.status(200).json({ ok: false, error: 'API 응답 오류', arrivals: [] });
    }

    const data = JSON.parse(text);

    if (data.realtimeArrivalList) {
      const arrivals = data.realtimeArrivalList.map(item => ({
        line:        item.subwayId,
        lineName:    item.subwayNm || '',
        dest:        item.trainLineNm || '',
        arrivalMsg:  item.arvlMsg2 || '',
        arrivalCode: item.arvlCd || '',
        barvlDt:     item.barvlDt || '',
        updnLine:    item.updnLine || '',
        stationName: item.statnNm || station,
      }));
      return res.status(200).json({ ok: true, arrivals });
    }

    return res.status(200).json({ ok: true, arrivals: [] });

  } catch (e) {
    console.error('subway error:', e);
    return res.status(500).json({ ok: false, error: e.message, arrivals: [] });
  }
};
