# 프로젝트: 변명공작소 (Excuse Factiory)

## 개요
일상 속 다양한 상황(지각, 마감 연기, 회식 불참 등)에 대해 AI가 
변명을 생성하고, 그 변명에 대한 상대방의 예상 반응까지 시뮬레이션해주는 
유머 웹 서비스. 사용자들은 변명을 공개 게시하고 투표할 수 있음.

## 기술 스택
- Frontend: Next.js (App Router, TypeScript) + Tailwind CSS
- AI: Claude API (Anthropic SDK)
- DB: Supabase (Postgres)
- 배포: Vercel
- 모바일 반응형 필수 (sm/md/lg breakpoint 사용)

## 핵심 기능 흐름
1. 사용자가 상황 + 카테고리 + 톤(정중함/유머러스/진지함/창의적) 입력
2. [변명 생성 에이전트] - Claude API 호출, 변명 3~4개 생성
3. 사용자가 마음에 드는 변명 + 듣는 사람 유형(까칠한 상사/츤데레 친구/
   빡친 애인/이해심 많은 동료/의심 많은 교수) 선택
4. [예상 반응 생성 에이전트] - 선택한 변명에 대한 상대방 반응 + 
   믿어줄 확률(believability score, 1~10) 생성
5. 결과 카드(변명 + 예상 반응 + 점수)를 명예의 전당에 게시/투표 가능

## API 라우트 구조
- src/app/api/generate-excuse/route.ts
  - input: { situation, category, tone }
  - output: { excuses: string[] }
- src/app/api/predict-reaction/route.ts
  - input: { excuse, listenerType }
  - output: { reaction: string, believability: number }

## DB 스키마 (Supabase)
- excuses 테이블: id, situation, category, tone, content, 
  listener_type, predicted_reaction, believability_score, votes, created_at
- votes_log 테이블: id, excuse_id, voter_session_id, created_at
  (중복 투표 방지)

## 코드 컨벤션
- 함수형 컴포넌트, named export
- API 키는 .env.local, 절대 클라이언트에 노출 금지
- Supabase RLS 정책 적용 (익명 read/write 허용 - 데모용)

## 작업 방식
기능 단위로 작은 단계씩 진행. 각 단계 후 npm run dev로 동작 확인 후 
다음 단계 진행. 큰 변경 전에는 계획을 먼저 설명하고 승인받기.