export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { stationName, stationId } = req.query;

  const key = process.env.BUS_KEY;

  if (!key) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
  }

  try {
    let url;

    if (stationId) {
      // 정류장 ID로 도착 정보 조회
      url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${key}&arsId=${stationId}&resultType=json`;
    } else if (stationName) {
      // 정류장 이름으로 검색
      const encoded = encodeURIComponent(stationName);
      url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByName?serviceKey=${key}&stSrch=${encoded}&resultType=json`;
    } else {
      return res.status(400).json({ error: '정류장 이름 또는 ID를 입력해주세요' });
    }

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    console.error('버스 API 오류:', error);
    return res.status(500).json({ error: '버스 정보를 가져오지 못했습니다' });
  }
}
