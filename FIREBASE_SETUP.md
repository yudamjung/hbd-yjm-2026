# Firebase + Vercel 셋업 가이드

이 프로젝트는 **편지 저장을 Firebase Firestore**에 하고, **프론트는 Vercel**로 배포합니다.
(코드는 이미 Firestore에 연결돼 있어요. 아래는 콘솔/배포에서 해야 할 일입니다.)

처음이어도 순서대로 따라오면 됩니다. 약 15분.

---

## 1단계 — Firestore 데이터베이스 만들기

1. [Firebase 콘솔](https://console.firebase.google.com) → 본인 프로젝트 선택
2. 왼쪽 메뉴 **빌드 → Firestore Database** 클릭
3. **데이터베이스 만들기** 클릭
4. 위치: **asia-northeast3 (서울)** 선택 (한 번 정하면 못 바꿔요)
5. 모드: **프로덕션 모드에서 시작** 선택 → 사용 설정
   - (규칙은 3단계에서 우리 규칙으로 교체할 거예요)

---

## 2단계 — 웹 앱 등록하고 설정값(config) 받기

1. 콘솔 좌측 상단 **⚙️ 톱니바퀴 → 프로젝트 설정**
2. 아래로 스크롤해 **내 앱** → **</> (웹)** 아이콘 클릭
3. 앱 닉네임 입력(예: `hbdyjm-web`) → **앱 등록** (호스팅 체크는 안 해도 됨)
4. 화면에 나오는 `firebaseConfig` 값을 복사해 둡니다. 이렇게 생겼어요:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234:web:abcd...",
   };
   ```

---

## 3단계 — `.env` 채우기

프로젝트 루트의 `.env` 파일을 열고, 2단계 값을 그대로 넣습니다 (키 이름 매핑):

| firebaseConfig | .env 변수 |
|---|---|
| apiKey | `VITE_FIREBASE_API_KEY` |
| authDomain | `VITE_FIREBASE_AUTH_DOMAIN` |
| projectId | `VITE_FIREBASE_PROJECT_ID` |
| storageBucket | `VITE_FIREBASE_STORAGE_BUCKET` |
| messagingSenderId | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| appId | `VITE_FIREBASE_APP_ID` |

`VITE_OWNER_KEY`는 생일자(양정민) 전용 로그인 비밀번호예요. 원하는 값으로 정하면 됩니다.

> 참고: 이 값들은 브라우저에 노출돼도 괜찮은 공개 설정값입니다. 실제 보안은 4단계의 **규칙**이 담당해요.
> `.env`는 git에 올라가지 않게 돼 있으니(.gitignore), Vercel 배포 때 따로 등록합니다(6단계).

저장 후 `npm run dev`를 껐다 켜야 값이 반영됩니다.

---

## 4단계 — 보안 규칙 적용

1. 콘솔 **Firestore Database → 규칙** 탭
2. 내용을 모두 지우고, 이 프로젝트의 **`firestore.rules`** 파일 내용을 그대로 붙여넣기
3. **게시** 클릭

이 규칙이 보장하는 것:
- 누구나 편지를 **읽기/작성** 가능 (로그인 없이 친구들이 편지 남김)
- 수정은 **내용·장식·음악만** 가능 (작성자 이름/비밀번호/위치는 못 바꿈)
- 삭제는 앱에서 불가 (콘솔에서만)

---

## 5단계 — 로컬에서 확인

```bash
npm run dev
```

- 카운트다운 화면에서 편지를 하나 작성해 보세요.
- Firebase 콘솔 **Firestore Database → 데이터** 탭에 `letters` 컬렉션과 문서가 생기면 성공!
- 다른 브라우저/기기에서 접속해도 같은 편지가 보이면 정상입니다.

---

## 6단계 — Vercel 배포

1. 코드를 GitHub 저장소에 push (`.env`는 안 올라가요 — 정상)
2. [vercel.com](https://vercel.com) 로그인 → **Add New → Project** → 그 GitHub 저장소 **Import**
3. Framework Preset: **Vite** 자동 인식 (Build: `npm run build`, Output: `dist` — 기본값 그대로)
4. **Environment Variables**에 `.env`의 7개 값을 그대로 등록:
   - `VITE_OWNER_KEY`
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
     `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
5. **Deploy** 클릭 → 끝나면 `https://...vercel.app` 주소가 나와요.

> 이후 GitHub에 push할 때마다 Vercel이 자동 재배포합니다.

---

## 자주 막히는 부분

- **편지가 안 보이거나 콘솔에 오류**: `.env` 값 오타 / dev 서버 재시작 안 함 / 4단계 규칙 미게시 중 하나예요.
- **"Missing or insufficient permissions"**: 규칙을 아직 게시하지 않았거나, 프로덕션 모드 기본 규칙(전체 차단)이 남아 있는 경우. 4단계를 다시 확인하세요.
- **Vercel에서 빈 화면**: 환경변수를 등록 안 했을 때. 등록 후 **Redeploy** 필요.
