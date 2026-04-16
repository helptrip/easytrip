# 🚀 GitHub Pages 배포 가이드
## "말하면 바로 가요" — 처음부터 끝까지

---

## STEP 1. GitHub 계정 만들기
1. https://github.com 접속
2. Sign up → 이메일/비밀번호 입력
3. 이름 추천: `malhabar` 또는 본인 이름

---

## STEP 2. 새 저장소(Repository) 만들기
1. 로그인 후 우측 상단 `+` → **New repository**
2. Repository name: `malhabar`
3. **Public** 선택 (GitHub Pages 무료 사용 조건)
4. **Add a README file** 체크
5. **Create repository** 클릭

---

## STEP 3. 파일 올리기 (드래그&드롭)
1. 생성된 저장소 페이지에서 **Add file → Upload files** 클릭
2. 아래 파일들을 드래그해서 올리기:
   ```
   index.html
   README.md
   .gitignore
   js/config.example.js
   js/speech.js
   js/api.js
   ```
3. **Commit changes** 클릭

> ⚠️ js/config.js 는 절대 올리지 마세요! (API 키가 들어있어요)

---

## STEP 4. GitHub Pages 활성화
1. 저장소 상단 **Settings** 탭 클릭
2. 왼쪽 메뉴 **Pages** 클릭
3. Source: **Deploy from a branch**
4. Branch: **main** / **/ (root)**
5. **Save** 클릭

약 1~2분 후 아래 주소로 접속 가능:
```
https://YOUR_USERNAME.github.io/malhabar
```

---

## STEP 5. 실제 음성인식 테스트
- **크롬(Chrome)** 브라우저 사용 권장
- 첫 접속 시 "마이크 접근 허용" 팝업 → **허용** 클릭
- HTTP가 아닌 **HTTPS**에서만 마이크가 동작해요
  (GitHub Pages는 자동으로 HTTPS 제공 ✅)

---

## STEP 6. API 키 발급 및 연결

### 지하철 실시간 API
1. https://data.seoul.go.kr 접속
2. 회원가입 → 로그인
3. 검색: "지하철실시간역정보"
4. **활용신청** → 즉시 발급 (무료)
5. 발급된 키를 `js/config.js`에 입력:
   ```js
   const CONFIG = {
     SEOUL_SUBWAY_KEY: '여기에 발급받은 키 입력',
     BUS_API_KEY: 'YOUR_KEY_HERE',
     DEMO_MODE: false,
   };
   ```

### 버스 실시간 API
1. https://data.go.kr 접속
2. 검색: "서울시 버스도착정보조회 서비스"
3. **활용신청** → 1~2일 내 승인 (무료)

---

## STEP 7. 파일 수정 (GitHub에서 직접)
1. 저장소에서 수정할 파일 클릭
2. 연필 ✏️ 아이콘 클릭
3. 수정 후 **Commit changes**
4. 자동으로 배포 반영 (1~2분 소요)

---

## ✅ 완료 체크리스트

- [ ] GitHub 계정 생성
- [ ] 저장소 생성 (malhabar)
- [ ] 파일 업로드
- [ ] GitHub Pages 활성화
- [ ] HTTPS 주소로 접속 확인
- [ ] 마이크 권한 허용 확인
- [ ] 음성인식 테스트 (크롬)
- [ ] 서울 열린데이터광장 API 키 발급
- [ ] 공공데이터포털 버스 API 키 신청
- [ ] config.js에 키 입력 후 테스트

---

## 📌 공모 제출 시 사용할 URL
```
https://YOUR_USERNAME.github.io/malhabar
```
이 주소를 제안서 "데모 링크"란에 기재하세요.
심사위원이 직접 스마트폰으로 접속해서 테스트할 수 있어요!
