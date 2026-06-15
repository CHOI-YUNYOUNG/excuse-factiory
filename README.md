# ⚙️ 변명공작소 (Excuse Factiory)

> **⚠️ 경고:** 이 서비스로 생성된 변명을 실제로 사용했다가 발생하는 모든 결과(해고, 이별, 유급, 절교 등)에 대해 개발자는 일체의 책임을 지지 않습니다. AI도 거짓말을 합니다. 당신의 상사는 생각보다 똑똑합니다.

지각, 마감 연기, 회식 불참… 인생은 변명이 필요한 순간의 연속입니다.  
**변명공작소**는 AI가 상황에 딱 맞는 그럴듯한 변명을 만들어주고, 상대방의 예상 반응까지 시뮬레이션해주는 유머 웹 서비스입니다.

🔗 **[변명공작소 바로가기](https://excuse-factiory.vercel.app)**

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🏭 **변명 생성기** | 상황 입력 + 카테고리 + 톤(정중함/유머러스/진지함/창의적) 선택 → AI가 변명 4개 생성 |
| 🎭 **반응 시뮬레이터** | 까칠한 상사, 빡친 애인, 츤데레 친구 등 5가지 유형의 예상 반응 + 믿어줄 확률 점수 |
| 🏆 **명예의 전당** | 공개 게시된 변명을 투표로 랭킹. 최고의 변명을 가려냅니다 |
| 💾 **내 보관함** | 내가 만든 변명을 저장하고 다시 꺼내볼 수 있어요 |

---

## 🤖 Claude Code 서브 에이전트

이 프로젝트는 **Claude Code**와 아래 서브 에이전트들을 활용해 개발되었습니다.

### `code-reviewer`
코드 작성 직후 자동 실행되는 리뷰어. TypeScript 타입 안정성, API 키 노출 여부, Tailwind 클래스 일관성, Supabase RLS 정책 누락을 체크합니다.

### `excuse-agent-designer`
`/api/generate-excuse`, `/api/predict-reaction` 라우트의 프롬프트 품질을 검토하는 에이전트. 변명이 충분히 창의적인지, 리스너 유형별 반응이 뚜렷하게 구분되는지 평가합니다.

### `db-schema-agent`
Supabase 테이블 스키마, 마이그레이션, RLS 정책 작성과 검토를 전담합니다.

---

## 🗂️ 프로젝트 구조

```
excuse-factiory/
├── app/
│   ├── page.tsx                      # 메인 — 변명 생성기 (4단계 플로우)
│   ├── ranking/page.tsx              # 명예의 전당
│   ├── collection/page.tsx           # 내 보관함
│   ├── components/
│   │   ├── Nav.tsx                   # 상단 네비게이션
│   │   ├── BeliefBar.tsx             # 믿어줄 확률 시각화 바
│   │   └── RankingCard.tsx           # 랭킹 카드 + 투표 버튼
│   ├── api/
│   │   ├── generate-excuse/route.ts  # 변명 생성 (Gemini API)
│   │   ├── predict-reaction/route.ts # 반응 예측 (Gemini API)
│   │   └── excuses/
│   │       ├── route.ts              # 변명 저장/조회 (Supabase)
│   │       └── [id]/vote/route.ts    # 투표 (중복 방지)
│   ├── lib/supabase.ts               # Supabase 클라이언트
│   └── types/index.ts                # 공통 타입 정의
├── .claude/agents/                   # Claude Code 서브 에이전트
├── CLAUDE.md                         # Claude Code 프로젝트 컨텍스트
└── AGENTS.md                         # Next.js 버전 주의사항
```

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **AI**: Google Gemini API (`gemini-2.5-flash-lite`)
- **DB**: Supabase (PostgreSQL) — 변명 저장, 투표, 중복 방지
- **배포**: Vercel

---

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 아래 값 입력:
# GEMINI_API_KEY=...
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 개발 서버 실행
npm run dev
```

---

## 🗃️ DB 스키마 (Supabase)

```sql
-- Supabase SQL Editor에서 실행
create table excuses (
  id uuid default gen_random_uuid() primary key,
  situation text not null,
  category text not null,
  tone text not null,
  content text not null,
  listener_type text,
  predicted_reaction text,
  believability_score integer,
  votes integer default 0,
  created_at timestamptz default now(),
  is_public boolean default false
);

create table votes_log (
  id uuid default gen_random_uuid() primary key,
  excuse_id uuid references excuses(id) on delete cascade,
  voter_session_id text not null,
  created_at timestamptz default now(),
  unique(excuse_id, voter_session_id)
);
```

---

## 💡 앞으로 추가하면 좋을 기능들

> 아이디어는 넘치고 시간은 부족한 개발자의 로드맵입니다.

### 🔥 빠르게 만들 수 있는 것들
- **오늘의 변명** — 매일 자정 AI가 추천하는 베스트 변명 1개 노출
- **변명 공유하기** — 카카오톡/인스타 스토리로 결과 카드 공유
- **변명 티어** — 믿어줄 확률 점수 기반 C / B / A / S / SSS 등급 부여
- **카테고리 확장** — 군대, 병원, 미용실 지각, 택배 미수령 등 추가

### 🧠 조금 더 공들여야 하는 것들
- **연속 변명 모드** — 상대방이 변명에 반박하면 재변명 생성. 몇 라운드까지 버티나
- **변명 vs 변명 토너먼트** — 두 변명을 붙여서 더 그럴듯한 것에 투표
- **실제 사용 후기** — "써봤어요" / "들켰어요" 버튼으로 변명 실전 성공률 추적
- **커스텀 리스너** — "우리 엄마", "군대 선임" 등 내가 직접 리스너 유형 설정
- **메신저 시뮬레이터** — 카카오톡 말풍선 UI로 변명 → 반응을 대화 형식으로 재현

### 🌐 소셜 / 커뮤니티
- **소셜 로그인** — 내 변명 히스토리를 기기 간 동기화
- **변명 구독** — 주 1회 베스트 변명 뉴스레터
- **명예의 전당 주간 리셋** — 주간 1위 변명은 별도 보관, 매주 새로운 경쟁
- **변명 언어 설정** — 영어, 일본어 변명 생성 (해외 출장 지각 대비)

### 🤯 언젠가는 (TMI 급)
- **변명 성우** — TTS로 변명을 실제로 읽어주는 기능. 목소리도 톤별로 다르게
- **변명 이미지 생성** — "차가 막혔다"는 변명에 맞는 극적인 교통체증 이미지 자동 생성
- **변명 분석 리포트** — "당신은 주로 지각 변명을 쓰며, 성공률은 42%입니다"

---

## ⚠️ 면책 조항

이 서비스는 **순수한 유머 목적**으로 제작되었습니다.

- 생성된 변명의 실제 사용 여부는 전적으로 사용자의 판단에 달려 있습니다
- AI가 만든 변명이라고 해서 더 믿어줄 이유는 없습니다
- "AI가 써줬어"라는 변명도 변명입니다
- 진짜 중요한 약속에는 진짜 이유를 말하세요

> 변명을 남발하다 보면 언젠가 진실도 의심받습니다. 오늘 하루도 적당히 성실하게.
