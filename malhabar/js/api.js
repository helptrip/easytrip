// =====================================================
// api.js — 서울시 실시간 대중교통 API
// =====================================================

const API = (() => {

  // CONFIG가 없으면 데모 모드
  const cfg = (typeof CONFIG !== 'undefined') ? CONFIG : { DEMO_MODE: true };

  // ── 지하철 실시간 도착정보 ──
  // API: 서울 열린데이터광장 "지하철실시간역정보"
  async function getSubwayArrival(stationName) {
    if (cfg.DEMO_MODE || !cfg.SEOUL_SUBWAY_KEY || cfg.SEOUL_SUBWAY_KEY === 'YOUR_KEY_HERE') {
      return getDemoSubway(stationName);
    }

    const url = `http://swopenAPI.seoul.go.kr/api/subway/${cfg.SEOUL_SUBWAY_KEY}/json/realtimeStationArrival/0/5/${encodeURIComponent(stationName)}`;

    try {
      const res  = await fetch(url);
      const data = await res.json();
      const list = data.realtimeArrivalList || [];

      return list.map(item => ({
        line:        item.subwayId,
        lineName:    item.trainLineNm,
        destination: item.bstatnNm,
        message:     item.arvlMsg2,
        remainTime:  item.barvlDt,  // 초 단위
        isExpress:   item.btrainSttus === '급행',
      }));
    } catch (e) {
      console.error('지하철 API 오류:', e);
      return getDemoSubway(stationName);
    }
  }

  // ── 버스 실시간 도착정보 ──
  // API: 공공데이터포털 "서울시 버스도착정보조회"
  async function getBusArrival(stationId) {
    if (cfg.DEMO_MODE || !cfg.BUS_API_KEY || cfg.BUS_API_KEY === 'YOUR_KEY_HERE') {
      return getDemoBus(stationId);
    }

    const url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${cfg.BUS_API_KEY}&arsId=${stationId}&resultType=json`;

    try {
      const res  = await fetch(url);
      const data = await res.json();
      const list = data.msgBody?.itemList || [];

      return list.map(item => ({
        busNo:       item.busRouteAbrv,
        routeId:     item.busRouteId,
        destination: item.nxtStn,
        remainMin:   Math.ceil(parseInt(item.sectOrd) || 0),
        message:     item.arrmsg1,
        isLowFloor:  item.busType === '1',
      }));
    } catch (e) {
      console.error('버스 API 오류:', e);
      return getDemoBus(stationId);
    }
  }

  // ── 데모 데이터 (API 키 없을 때) ──
  function getDemoSubway(station) {
    const now = new Date();
    const min = now.getMinutes();
    return [
      { line: '2', lineName: '2호선 내선', destination: '강남', message: `${(min%7)+2}분 후 도착`, remainTime: ((min%7)+2)*60, isExpress: false },
      { line: '2', lineName: '2호선 급행', destination: '강남', message: `${(min%12)+6}분 후 도착`, remainTime: ((min%12)+6)*60, isExpress: true },
      { line: '9', lineName: '9호선 급행', destination: '언주',  message: `${(min%5)+3}분 후 도착`, remainTime: ((min%5)+3)*60, isExpress: true },
    ];
  }

  function getDemoBus(stationId) {
    const now = new Date();
    const sec = now.getSeconds();
    return [
      { busNo: '140',  destination: '서울역', remainMin: (sec % 4) + 1,  message: `${(sec%4)+1}분 후`, isLowFloor: true },
      { busNo: '3412', destination: '논현역', remainMin: (sec % 6) + 4,  message: `${(sec%6)+4}분 후`, isLowFloor: false },
      { busNo: '9407', destination: '판교',   remainMin: (sec % 8) + 7,  message: `${(sec%8)+7}분 후`, isLowFloor: false },
      { busNo: '4412', destination: '역삼역', remainMin: (sec % 5) + 11, message: `${(sec%5)+11}분 후`, isLowFloor: true },
    ];
  }

  // ── 목적지 텍스트 파싱 ──
  // "강남역 가고 싶어" → { from: '현재위치', to: '강남' }
  function parseDestination(text) {
    const patterns = [
      /(.+?)(?:역|역까지|까지|에|으로|로)\s*(?:가고싶어|가자|가주세요|어떻게가|어떻게 가|데려다|알려줘)?/,
      /(.+?)\s*(?:going to|take me to|how to get to|get to)/i,
      /(.+?)(?:站|まで|に行き)/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { to: match[1].trim().replace(/\s+/g, '') };
      }
    }
    return { to: text.trim() };
  }

  return {
    getSubwayArrival,
    getBusArrival,
    parseDestination,
    isDemoMode: () => cfg.DEMO_MODE || !cfg.SEOUL_SUBWAY_KEY || cfg.SEOUL_SUBWAY_KEY === 'YOUR_KEY_HERE',
  };
})();
