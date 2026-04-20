# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Component Generator는 자연어 프롬프트로 React 컴포넌트를 AI가 생성해주는 도구입니다.

**기술 스택:**
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Bun (경량 JavaScript 런타임)
- **AI Providers**: Anthropic Claude, Google Gemini
- **Preview**: react-live (런타임 JSX 렌더링)
- **UI Design**: LG Design System (라이트 테마, 접근성 준수)

## Architecture

### Full Stack Flow

```
User Input (App.tsx)
    ↓
useComponentGenerator Hook (상태 관리, API 호출)
    ↓
Vite Proxy (/api → http://localhost:3002)
    ↓
Bun Server (server/index.ts)
    ├─ /api/config: 환경변수 확인 (ANTHROPIC_API_KEY, GOOGLE_API_KEY)
    └─ /api/generate: AI 프롬프트 처리
        ├─ callAnthropic() → Claude Haiku 4.5
        └─ callGoogle() → Gemini 2.5 Flash
    ↓
React Component (JSX 코드 반환)
    ↓
LivePreview (react-live로 렌더링) + CodeView (코드 표시)
```

### Key Design Decisions

1. **Vite Dev Server Proxy**: Vite가 `/api/*` 요청을 Bun 서버로 프록시하므로 CORS 처리 필요 없음
2. **Inline Styles Only**: 생성된 컴포넌트는 CSS 임포트 불가 → SYSTEM_PROMPT에서 강제
3. **Plain JavaScript**: 생성 코드에 TypeScript 타입 불허 (JSX만 사용, 타입 없음)
4. **react-live Render**: 생성된 코드를 즉시 실행 → 샌드박스 환경에서 에러 처리 필수
5. **Multi-Provider**: Claude와 Gemini 중 사용자 선택 가능 → 드롭다운으로 선택

### Component Hierarchy

```
App.tsx (main)
├─ Header (Provider 선택, API 키 입력)
├─ PromptInput (프롬프트 입력, 예시 칩)
├─ PromptExamples (시각적 임팩트 큰 예시들)
└─ ResultsSection (생성된 컴포넌트 목록)
   └─ ComponentCard[] (각 컴포넌트)
      ├─ LivePreview (react-live)
      └─ CodeView (코드 표시 + 복사 버튼)
```

### State Management

`useComponentGenerator()` hook이 모든 상태 관리:
- `components`: 생성된 컴포넌트 배열 (ID, 프롬프트, 코드, 타임스탐프)
- `isLoading`: 생성 중 상태
- `error`: API 에러 메시지
- `generate()`, `removeComponent()`, `clearAll()` 액션

## Development Commands

```bash
# 전체 실행 (API 서버 + 프론트엔드 동시)
bun run dev

# API 서버만 실행 (watch mode)
bun run server

# 프로덕션 빌드
bun run build

# ESLint 검사
bun run lint

# 빌드 결과 미리보기
bun run preview
```

**포트:**
- Frontend: http://localhost:5173 (Vite)
- Backend: http://localhost:3002 (Bun)

## Configuration

### .env (프로젝트 루트)

```env
# API 키 (선택사항 - UI에서도 입력 가능)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

- 환경변수 설정 시 UI에서 입력 불필요
- 환경변수 없으면 UI에서 직접 입력 가능
- UI 입력이 환경변수보다 우선

### vite.config.ts

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3002',  // Bun 서버로 프록시
    changeOrigin: true,
  },
}
```

## Important Code Patterns

### AI System Prompt (server/index.ts)

생성된 컴포넌트의 형식을 정의하는 핵심 시스템 프롬프트:

```
- Inline styles only (CSS 임포트 금지)
- React는 전역으로 가정 (import 불필요)
- 컴포넌트 정의 후 render(<ComponentName />) 호출
- Plain JavaScript만 (TypeScript 타입 불허)
- 응답은 코드만 (마크다운 설명 금지)
```

이를 수정하면 생성 결과가 크게 달라집니다.

### API Response Format

```typescript
// /api/generate 응답
{
  code: "const MyComponent = () => { ... }; render(<MyComponent />);"
}

// 에러
{
  error: "Error message"
}
```

### Error Handling in Bun

서버는 다음 상황을 특수 처리:
- `503`: API 서버 과부하 → "일시적으로 과부하" 메시지
- `429`: Rate limit → "요청이 너무 많음" 메시지
- 다른 에러: 원본 에러 메시지 반환

## CSS/Design System

**LG Design System 색상 변수** (src/App.css):
```css
--lg-primary: #333333      /* 주요 텍스트/배경 */
--lg-secondary: #666666    /* 보조 텍스트 */
--lg-accent: #0066cc       /* 액션 버튼 */
--lg-border: #e5e5e5       /* 보더 */
--lg-bg-white: #ffffff     /* 배경 */
```

모든 스타일링은 이 변수를 사용하므로 일관성 유지 가능.

## Common Development Tasks

### 새 컴포넌트 추가

1. `src/components/<Name>.tsx` 생성
2. `App.tsx`에 임포트 및 렌더링
3. 필요시 `src/types/index.ts`에 타입 추가

### API 엔드포인트 추가

1. `server/index.ts`에 새 라우트 추가
2. `POST /api/generate`와 동일하게 CORS 헤더 포함
3. Vite proxy 설정 자동 적용 (이미 `/api/*` 설정됨)

### 스타일 변경

- `src/App.css`의 CSS 변수 수정
- 즉시 HMR(Hot Module Reload)로 반영됨

### System Prompt 튜닝

- `server/index.ts`의 `SYSTEM_PROMPT` 상수 수정
- 컴포넌트 생성 품질 향상 가능 (색상 스타일, 레이아웃 등)

## Debugging

### 생성된 컴포넌트가 렌더링 안 됨

1. 브라우저 콘솔 확인 → react-live LiveError 표시
2. `stripCodeFences()`, `ensureRenderCall()` 로직 확인 (server/index.ts)
3. AI가 반환한 코드가 평문 JavaScript + 인라인 스타일 준수하는지 확인

### API 응답 에러

1. Network 탭에서 `/api/generate` 요청 확인
2. API 키 유효성 확인 (환경변수 또는 UI 입력)
3. Bun 서버 콘솔 로그 확인
4. 외부 API (Claude, Gemini) 상태 확인

### Vite Proxy 동작 안 함

- Bun 서버가 포트 3002에서 실행 중인지 확인
- 방화벽/네트워크 문제 확인
- `vite.config.ts`의 proxy 설정 재확인

## Testing

```bash
# 빌드 결과 테스트
bun run build
bun run preview  # http://localhost:4173에서 확인
```

**수동 테스트 시나리오:**
1. 프롬프트 입력 → 컴포넌트 생성
2. 코드 복사 버튼 동작 확인
3. 새로고침/재생성 버튼 동작
4. 여러 컴포넌트 생성 후 전체 삭제
5. API 키 입력/환경변수 전환

## Known Limitations

- 생성 코드는 인라인 스타일만 사용 (CSS 클래스/모듈 불가)
- TypeScript 불가 (plain JavaScript만)
- 외부 라이브러리 임포트 불가 (React 기본만 사용)
- 생성 시간: Claude ~2-5초, Gemini ~1-3초 (네트워크/API 상태 의존)
