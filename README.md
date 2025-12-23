BENJI HAIR - Customer Experience Management System (Japan Edition)

일본 미용실 체인 'BENJI'를 위한 비대면 사전 상담 및 고객 관리 웹 애플리케이션입니다.
별도의 백엔드 서버 구축 없이 **Firebase(Serverless)**를 활용하여 실시간 데이터 동기화 및 관리자 기능을 구현했으며, GitHub Actions를 통해 완전 자동화된 배포 파이프라인(CI/CD)을 구축했습니다.

라이브 데모 보러가기 (Live Demo)  >> https://benji-hair-shop.web.app/

 1. 프로젝트 개요 (Overview)

목적: 미용실 방문 전/대기 중에 고객이 자신의 모발 상태, 시술 이력, 스타일 선호도를 미리 작성하여 디자이너에게 전달합니다.

핵심 가치:

고객 경험(CX) 향상: 종이 차트 대신 모바일로 간편하게 상담지 작성.

업무 효율화: 디자이너는 자동 번역된 정보를 통해 외국인 손님 응대 부담 감소.

운영 자동화: 실시간 대기열 확인 및 원클릭 고객 관리.

 2. 기술 스택 (Tech Stack)

Frontend

Framework: React.js (v19)

Styling: Tailwind CSS (CDN)

Icons: Lucide React

Backend (Serverless)

Database: Firebase Firestore (NoSQL, Real-time sync)

Auth: Firebase Authentication (Anonymous Login)

Hosting: Firebase Hosting

DevOps

Version Control: Git & GitHub

CI/CD: GitHub Actions (Push 시 자동 빌드 및 배포)

 3. 주요 기능 (Key Features)

고객용 (Client View)

다국어 지원 (i18n): 일본어(기본), 한국어, 영어 지원.

4단계 상담 프로세스:

Step 1 (기본 정보): 이름, 연락처, 개인정보 동의.

Step 2 (모발 진단): 머리 길이, 두피 상태, 최근 시술 이력 체크.

Step 3 (상세 선호도): 마사지 강도, 제품 사용 여부, 스타일링 선호도.

Step 4 (확인 및 제출): 작성 내용 요약 확인.

동적 폼 (Dynamic Form): '기타' 선택 시 입력창 활성화, 항목 추가/삭제 기능.

 관리자용 (Admin Dashboard)

실시간 대기 리스트: onSnapshot을 활용하여 새로고침 없이 신규 고객 확인.

스마트 자동 번역: 고객이 한국어/영어로 입력해도 관리자 화면에는 항상 일본어로 자동 변환되어 표시.

위험군 자동 알림 (Critical Alert): 탈모, 두피 문제, 약물 복용 여부 등 주의사항 발생 시 빨간색 경고 박스 자동 노출.

상태 관리: 상담 대기중 🟢 → 시술 중 🔵 → 시술 완료 ⚪ 상태 변경.

데이터 관리: 직관적인 삭제 기능 (실수 방지 UI 적용).

4. 설치 및 실행 방법 (Installation)

이 프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요.

# 1. 저장소 복제 (Clone)
git clone https://github.com/melamela0109/benji-hair-cpx-jp.git

# 2. 프로젝트 폴더로 이동
cd benji-hair-shop

# 3. 의존성 패키지 설치
npm install

# 4. 개발 서버 실행
npm start


5. 개발 시행착오 및 해결 (Troubleshooting Log)

프로젝트 개발 및 배포 자동화 과정에서 겪은 주요 이슈와 해결 방법입니다.

Issue 1: GitHub Actions 배포 실패 (Node.js 버전 호환성)

증상: Firebase CLI v15.1.0 is incompatible with Node.js v18... 에러 발생하며 배포 실패.

원인: 최신 Firebase 도구는 Node.js 20 이상을 요구하나, 워크플로우 설정은 v18로 되어 있었음.

해결: GitHub Actions 설정 파일(.yml)의 node-version을 20으로 업그레이드하여 해결.

 Issue 2: React 빌드 중단 (Treating warnings as errors)

증상: 코드 내 사소한 경고(Warning) 때문에 CI 빌드가 멈춤.

해결: 빌드 명령어에 CI=false 환경 변수를 추가하여 경고를 무시하고 강제 빌드되도록 설정.

- run: CI=false npm run build


Issue 3: 관리자 삭제 버튼 무반응

증상: 관리자 모드에서 삭제 버튼을 눌러도 반응이 없거나 팝업이 뜨지 않음.

원인: 일부 모바일/프리뷰 환경에서 브라우저의 window.confirm 알림창이 차단됨.

해결: 시스템 팝업 대신 화면 내(In-UI) 확인 버튼([네, 삭제] / [취소])이 나타나도록 UI 로직을 전면 수정하여 UX 개선.

 Issue 4: 다국어 데이터의 관리자 표시 문제

증상: 한국 고객이 '짧음'을 선택하면 일본인 디자이너가 이해하지 못함.

해결: getJapaneseValue 함수를 구현하여, 입력된 데이터(KO/EN)를 매칭되는 일본어 키워드로 실시간 변환하여 렌더링.

6. 배포 가이드 (Deployment)

이 프로젝트는 GitHub Actions를 통해 배포가 100% 자동화되어 있습니다.

VS Code에서 코드를 수정하고 저장합니다.

터미널에 다음 명령어를 입력합니다.

git add .
git commit -m "README 링크 수정"
git push


GitHub가 변경 사항을 감지하고 자동으로 빌드 후 Firebase Hosting에 배포합니다. (약 1~2분 소요)

Author: Byunghun PARK
Last Updated: 2024. 12. 24