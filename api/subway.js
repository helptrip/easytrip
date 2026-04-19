export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { station } = req.query;

  if (!station) {
    return res.status(400).json({ error: '역 이름을 입력해주세요' });
  }

  const key = process.env.SUBWAY_KEY;

  if (!key) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
  }

  try {
    const encodedStation = encodeURIComponent(station);
    const url = `http://swopenAPI.seoul.go.kr/api/subway/${key}/json/realtimeStationArrival/0/10/${encodedStation}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    console.error('지하철 API 오류:', error);
    return res.status(500).json({ error: '지하철 정보를 가져오지 못했습니다' });
  }
}
