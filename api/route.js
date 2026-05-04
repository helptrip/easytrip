module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { startX, startY, endX, endY, startName, endName } = req.query;

  if (!startX || !startY || !endX || !endY) {
    return res.status(400).json({ error: '출발/도착 좌표 필요 (startX,startY,endX,endY)' });
  }

  const key = process.env.TMAP_KEY;
  if (!key) return res.status(500).json({ error: 'TMAP API 키 없음' });

  try {
    const url = 'https://apis.openapi.sk.com/transit/routes';
    const body = {
      startX: parseFloat(startX),
      startY: parseFloat(startY),
      endX:   parseFloat(endX),
      endY:   parseFloat(endY),
      reqCoordType: 'WGS84GEO',
      resCoordType: 'WGS84GEO',
      startName: startName || '출발지',
      endName:   endName   || '도착지',
      searchDttm: new Date().toISOString().slice(0,16).replace('T',' '),
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'appKey': key,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(200).json({ ok: false, error: `TMAP HTTP ${r.status}`, detail: errText });
    }

    const data = await r.json();

    // 경로가 없으면
    if (!data.metaData?.plan?.itineraries?.length) {
      return res.status(200).json({ ok: false, error: '경로를 찾을 수 없어요', raw: data });
    }

    const itineraries = data.metaData.plan.itineraries;

    // 경로 정규화
    const routes = itineraries.slice(0, 3).map(it => {
      const legs = it.legs.map(leg => ({
        mode:        leg.mode,           // WALK / SUBWAY / BUS
        sectionTime: leg.sectionTime,    // 소요시간(분)
        distance:    leg.distance,       // 거리(m)
        start: {
          name: leg.start?.name || '',
          lat:  leg.start?.lat  || 0,
          lon:  leg.start?.lon  || 0,
        },
        end: {
          name: leg.end?.name || '',
          lat:  leg.end?.lat  || 0,
          lon:  leg.end?.lon  || 0,
        },
        // 대중교통 정보
        route:       leg.route       || '',  // 노선명
        routeColor:  leg.routeColor  || '',  // 노선 색상
        passStopList: (leg.passStopList?.stationList || []).map(s => ({
          name: s.stationName,
          lat:  s.lat,
          lon:  s.lon,
        })),
        // 도보 경로 포인트
        steps: (leg.steps || []).map(step => ({
          streetName:  step.streetName  || '',
          distance:    step.distance    || 0,
          description: step.description || '',
          turnType:    step.turnType    || 0,
        })),
        // 전체 폴리라인 포인트
        passShape: (leg.passShape?.linestring || '').split(' ').map(p => {
          const [lon, lat] = p.split(',');
          return { lat: parseFloat(lat), lon: parseFloat(lon) };
        }).filter(p => p.lat && p.lon),
      }));

      return {
        totalTime:     it.totalTime,      // 총 소요시간(분)
        totalWalkTime: it.totalWalkTime,  // 총 도보시간(분)
        totalDistance: it.totalDistance,  // 총 거리(m)
        transferCount: it.transferCount,  // 환승 횟수
        fare:          it.fare?.regular?.totalFare || 0, // 요금
        legs,
      };
    });

    return res.status(200).json({ ok: true, routes });

  } catch (e) {
    console.error('route error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
