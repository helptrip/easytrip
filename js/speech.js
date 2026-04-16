// =====================================================
// speech.js — Web Speech API 음성인식
// 크롬/엣지에서 동작 (사파리 일부 지원)
// =====================================================

const Speech = (() => {
  // 브라우저 지원 여부 확인
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('이 브라우저는 음성인식을 지원하지 않아요. 크롬을 사용해주세요.');
    return null;
  }

  const recognition = new SpeechRecognition();

  // 언어별 코드
  const LANG_CODES = {
    ko: 'ko-KR',
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
  };

  let onResultCb  = null;
  let onErrorCb   = null;
  let onStartCb   = null;
  let listening   = false;

  recognition.continuous      = false;
  recognition.interimResults  = true;  // 중간 결과 표시
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    if (onStartCb) onStartCb();
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const isFinal    = e.results[0].isFinal;
    if (onResultCb) onResultCb(transcript, isFinal);
  };

  recognition.onerror = (e) => {
    listening = false;
    let msg = '음성 인식 오류';
    if (e.error === 'not-allowed')  msg = '마이크 접근 권한이 필요해요';
    if (e.error === 'no-speech')    msg = '음성이 감지되지 않았어요. 다시 시도해주세요';
    if (e.error === 'network')      msg = '네트워크 오류. 인터넷을 확인해주세요';
    if (onErrorCb) onErrorCb(msg);
  };

  recognition.onend = () => { listening = false; };

  return {
    // 언어 설정 후 인식 시작
    start(langCode) {
      if (listening) recognition.stop();
      recognition.lang = LANG_CODES[langCode] || 'ko-KR';
      try {
        recognition.start();
      } catch(e) {
        console.error('음성인식 시작 오류:', e);
      }
    },

    stop() {
      if (listening) recognition.stop();
    },

    onResult(cb)  { onResultCb  = cb; },
    onError(cb)   { onErrorCb   = cb; },
    onStart(cb)   { onStartCb   = cb; },

    isSupported() { return true; },
  };
})();

// ── 사용 예시 ──
// Speech.onStart(() => { /* 마이크 버튼 활성화 */ });
// Speech.onResult((text, isFinal) => {
//   if (isFinal) parseDestination(text);
// });
// Speech.onError((msg) => { alert(msg); });
// Speech.start('ko');  // 한국어 시작
