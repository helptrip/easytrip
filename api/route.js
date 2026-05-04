module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { startX, startY, endX, endY } = req.query;
  if (!startX || !startY || !endX || !endY)
    return res.status(400).json({ error: '좌표 필요' });

  const key = process.env.KAKAO_KEY;
  if (!key) return res.status(500).json({ error: 'API 키 없음' });

  try {
    // 카카오 도보 길찾기
    const url = `https://dapi.kakao.com/v1/directions?origin=${startX},${startY}&destination=${endX},${endY}&priority=RECOMMEND`;
    const r = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
    if (!r.ok) {
      const t = await r.text();
      return res.status(200).json({ ok: false, error: `Kakao HTTP ${r.status}`, detail: t });
    }
    const data = await r.json();
    if (!data.routes || !data.routes.length)
      return res.status(200).json({ ok: false, error: '경로 없음' });

    const route = data.routes[0];
    const summary = route.summary;

    // 경로 폴리라인 포인트 추출
    const points = [];
    (route.sections || []).forEach(sec => {
      (sec.roads || []).forEach(road => {
        const v = road.vertexes || [];
        for (let i = 0; i < v.length; i += 2) {
          points.push({ lng: v[i], lat: v[i+1] });
        }
      });
    });

    // 안내 포인트
    const guides = [];
    (route.sections || []).forEach(sec => {
      (sec.guides || []).forEach(g => {
        guides.push({
          name: g.name || '',
          x: g.x, y: g.y,
          distance: g.distance,
          guidance: g.guidance || '',
          type: g.type,
        });
      });
    });

    return res.status(200).json({
      ok: true,
      summary: {
        distance: summary.distance,
        duration: summary.duration,
      },
      points,
      guides,
    });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
