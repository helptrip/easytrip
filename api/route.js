module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { startX, startY, endX, endY } = req.query;
  if (!startX || !startY || !endX || !endY)
    return res.status(400).json({ error: '좌표 필요 (startX=경도, startY=위도)' });

  const key = process.env.SEOUL_ROUTE_KEY;
  if (!key) return res.status(500).json({ error: 'API 키 없음' });

  try {
    // 서울시 대중교통 환승경로 조회
    const encoded = encodeURIComponent(key);
    const url = `http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBusNSub`
      + `?serviceKey=${encoded}`
      + `&startX=${startX}&startY=${startY}`
      + `&endX=${endX}&endY=${endY}`
      + `&resultType=json`;

    const r = await fetch(url);
    const text = await r.text();

    // HTML 응답이면 키 오류
    if (text.trim().startsWith('<') && text.includes('<!DOCTYPE')) {
      // XML 응답 시도
      return res.status(200).json({ ok: false, error: 'API 응답 오류', raw: text.slice(0, 200) });
    }

    let data;
    try { data = JSON.parse(text); }
    catch(e) {
      // XML 파싱
      return res.status(200).json({ ok: false, error: 'XML 응답', raw: text.slice(0, 500) });
    }

    const result = data?.msgBody;
    if (!result) return res.status(200).json({ ok: false, error: '경로 없음', raw: data });

    // 경로 목록 정규화
    const paths = (result.itemList || (Array.isArray(result) ? result : [result]));

    const routes = paths.slice(0, 3).map(item => {
      // 경로 단계 파싱
      const legs = [];

      // 출발 도보
      if (item.firstStartStation) {
        legs.push({
          mode: 'WALK',
          distance: parseInt(item.firstSectionDistance || 0),
          sectionTime: parseInt(item.firstSectionTime || 0),
          start: { name: '현재 위치' },
          end: { name: item.firstStartStation },
        });
      }

      // 대중교통 구간들
      const subPaths = item.subPath || [];
      (Array.isArray(subPaths) ? subPaths : [subPaths]).forEach(sp => {
        if (!sp) return;
        const mode = sp.trafficType === '1' ? 'SUBWAY' :
                     sp.trafficType === '2' ? 'BUS' : 'WALK';
        legs.push({
          mode,
          distance: parseInt(sp.distance || 0),
          sectionTime: parseInt(sp.sectionTime || 0),
          start: {
            name: sp.startName || '',
            lat: parseFloat(sp.startY || 0),
            lng: parseFloat(sp.startX || 0),
          },
          end: {
            name: sp.endName || '',
            lat: parseFloat(sp.endY || 0),
            lng: parseFloat(sp.endX || 0),
          },
          route: sp.lane?.[0]?.name || sp.lane?.[0]?.busNo || '',
          routeColor: sp.lane?.[0]?.subwayCode
            ? ['','#0052A4','#00A650','#EF7C1C','#00A0E9','#996CAC',
               '#CD7C2F','#747F00','#E6186C','#BDB092'][sp.lane[0].subwayCode] || '#333'
            : '#1A73E8',
          passStops: (sp.passStopList?.stations || []).map(s => ({
            name: s.stationName,
            lat: parseFloat(s.y || 0),
            lng: parseFloat(s.x || 0),
          })),
        });
      });

      // 도착 도보
      if (item.lastEndStation) {
        legs.push({
          mode: 'WALK',
          distance: parseInt(item.lastSectionDistance || 0),
          sectionTime: parseInt(item.lastSectionTime || 0),
          start: { name: item.lastEndStation },
          end: { name: '목적지' },
        });
      }

      return {
        totalTime: parseInt(item.totalTime || 0),
        totalWalk: parseInt(item.totalWalk || 0),
        totalDistance: parseInt(item.totalDistance || 0),
        transferCount: parseInt(item.transferCount || 0),
        fare: parseInt(item.totalFare || 0),
        legs,
      };
    });

    return res.status(200).json({ ok: true, routes });

  } catch (e) {
    console.error('route error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
