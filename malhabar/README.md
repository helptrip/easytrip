# 🎙️ 말하면 바로 가요 (Go When You Say It)

> 어르신을 위한 AI 음성 대중교통 통합 안내 서비스  
> Voice-first public transit guide for seniors — Korean / English / 中文 / 日本語

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://YOUR_USERNAME.github.io/malhabar)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📱 서비스 소개

기존 지하철 앱은 텍스트 검색 중심으로 어르신이 사용하기 어렵습니다.  
**말하면 바로 가요**는 음성 입력 하나로 지하철 경로 탐색부터 연계 버스까지 안내합니다.

| 기능 | 설명 |
|------|------|
| 🎙️ 음성 퍼스트 | 앱 실행 즉시 음성 대기, 버튼 없이 말만 하면 됨 |
| 🚇 일반/급행 비교 | 한 화면에서 두 경로 동시 비교 |
| 🚌 버스 연계 | 지하철 도착역 연계 버스 자동 표시 |
| 🌍 4개 언어 | 한국어 · English · 中文 · 日本語 |
| ♿ 시니어 UI | 대형 글씨, 고대비, 3단계 이내 완결 |

---

## 🔧 사용 기술

- **Frontend**: Vanilla HTML/CSS/JS (프레임워크 없음 — 배포 간소화)
- **음성인식**: Web Speech API (브라우저 내장, 무료)
- **지하철 API**: 서울 열린데이터광장 실시간 API
- **버스 API**: 서울시 버스 실시간 도착정보 API
- **배포**: GitHub Pages (무료)

---

## 🚀 로컬 실행

```bash
git clone https://github.com/YOUR_USERNAME/malhabar.git
cd malhabar
# 브라우저에서 index.html 열기 (서버 불필요)
open index.html
```

## 🌐 API 키 설정

`js/config.js` 파일에 발급받은 키를 입력하세요:

```js
// js/config.js
const CONFIG = {
  SEOUL_API_KEY: 'YOUR_KEY_HERE',   // 서울 열린데이터광장
  BUS_API_KEY:   'YOUR_KEY_HERE',   // 공공데이터포털
};
```

### API 키 발급처
- 지하철 실시간: https://data.seoul.go.kr → "지하철실시간역정보"
- 버스 실시간: https://data.go.kr → "서울시 버스도착정보"

---

## 📁 파일 구조

```
malhabar/
├── index.html          # 메인 앱 (GitHub Pages 진입점)
├── js/
│   ├── config.js       # API 키 설정 (git에 올리지 마세요!)
│   ├── app.js          # 화면 전환, 언어 설정
│   ├── speech.js       # 음성인식 (Web Speech API)
│   └── api.js          # 지하철/버스 API 호출
├── css/
│   └── style.css       # 스타일
├── .gitignore
└── README.md
```

---

## 📋 공모 관련

| 공모 | 기관 | 상태 |
|------|------|------|
| 서울시 시민참여예산 | 서울특별시 | 신청 가능 |
| 약자동행 디지털 접근성 | 서울시 복지실 | 공고 대기 |
| 디지털플랫폼정부 혁신서비스 | 행정안전부 | 하반기 예정 |
| 오픈이노베이션 | 창업진흥원 | 하반기 예정 |

---

## 👤 개발자

1인 개발 · 간이과세자 · 소프트웨어 개발업  
문의: [이메일 기재]

---

## 📄 라이선스

MIT License — 공공 목적 자유 이용 가능
