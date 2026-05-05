module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { startX, startY, endX, endY } = req.query;
  if (!startX || !startY || !endX || !endY)
    return res.status(400).json({ error: '좌표 필요 (startX=경도, startY=위도)' });

  const key = process.env.ODSAY_KEY;
  if (!key) return res.status(500).json({ error: 'ODSAY_KEY 없음' });

  try {
    // ODsay 대중교통 경로탐색
    const url = `https://api.odsay.com/v1/api/searchPubTransPathT`
      + `?SX=${startX}&SY=${startY}`
      + `&EX=${endX}&EY=${endY}`
      + `&apiKey=${encodeURIComponent(key)}`;

    const r = await fetch(url);
    const text = await r.text();

    if (text.trim().startsWith('<'))
      return res.status(200).json({ ok: false, error: 'API 오류', raw: text.slice(0,300) });

    const data = JSON.parse(text);

    if (data.error)
      return res.status(200).json({ ok: false, error: data.error.message || 'ODsay 오류', raw: data });

    const paths = data?.result?.path || [];
    if (!paths.length)
      return res.status(200).json({ ok: false, error: '경로 없음' });

    // 경로 정규화
    const routes = paths.slice(0, 3).map(path => {
      const info = path.info;
      const legs = (path.subPath || []).map(sp => {
        const mode = sp.trafficType === 1 ? 'SUBWAY'
                   : sp.trafficType === 2 ? 'BUS'
                   : 'WALK';

        // 노선 색상
        const subwayColors = {
          1:'#0052A4',2:'#00A650',3:'#EF7C1C',4:'#00A0E9',
          5:'#996CAC',6:'#CD7C2F',7:'#747F00',8:'#E6186C',9:'#BDB092'
        };

        return {
          mode,
          sectionTime: sp.sectionTime || 0,
          distance:    sp.distance    || 0,
          start: {
            name: sp.startName || '',
            lat:  sp.startY    || 0,
            lng:  sp.startX    || 0,
          },
          end: {
            name: sp.endName || '',
            lat:  sp.endY    || 0,
            lng:  sp.endX    || 0,
          },
          // 대중교통 정보
          route:      sp.lane?.[0]?.name   || sp.lane?.[0]?.busNo || '',
          routeColor: sp.trafficType === 1
            ? (subwayColors[sp.lane?.[0]?.subwayCode] || '#333')
            : '#1A73E8',
          stationCount: sp.stationCount || 0,
          // 경유 정류장
          passStops: (sp.passStopList?.stations || []).map(s => ({
            name: s.stationName,
            lat:  s.y || 0,
            lng:  s.x || 0,
            idx:  s.index,
          })),
          // 도보 안내
          steps: mode === 'WALK' ? [{
            description: sp.distance ? `${sp.distance}m 이동` : '이동',
            distance: sp.distance || 0,
          }] : [],
        };
      });

      return {
        totalTime:     info.totalTime     || 0,  // 총 소요시간(분)
        totalWalk:     info.totalWalk     || 0,  // 총 도보시간(분)
        totalDistance: info.totalDistance || 0,  // 총 거리(m)
        transferCount: info.transitCount  || 0,  // 환승 횟수
        fare:          info.payment       || 0,  // 요금
        firstStation:  info.firstStartStation || '',
        lastStation:   info.lastEndStation    || '',
        legs,
      };
    });

    return res.status(200).json({ ok: true, routes });

  } catch (e) {
    console.error('route error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
