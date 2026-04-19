export default async function handler(req, res) {
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

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // 응답 정규화
    if (data.realtimeArrivalList) {
      const arrivals = data.realtimeArrivalList.map(item => ({
        line:       item.subwayId,         // 노선 ID (1001=1호선, 1002=2호선...)
        lineName:   item.subwayNm || '',   // 노선명
        dest:       item.trainLineNm || '',// 행선지 (예: 강남방면)
        arrivalMsg: item.arvlMsg2 || '',   // 도착 메시지 (예: 2분 후)
        arrivalCode:item.arvlCd || '',     // 0=진입, 1=도착, 2=출발, 3=전역출발, 4=전역진입, 5=전역도착, 99=운행중
        barvlDt:    item.barvlDt || '',    // 도착 예정 시간(초)
        updnLine:   item.updnLine || '',   // 상/하행
        stationName:item.statnNm || station,
      }));
      return res.status(200).json({ ok: true, arrivals, raw: data });
    }

    // API는 성공했지만 열차 없음 (심야, 운행종료 등)
    return res.status(200).json({ ok: true, arrivals: [], raw: data });

  } catch (e) {
    console.error('subway error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
