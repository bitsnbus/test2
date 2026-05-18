# 오디오 믹서 앱

React, TypeScript, Web Audio API로 구축한 웹 기반 멀티트랙 오디오 믹서입니다.

## 기술 스택

- **React** — UI 컴포넌트 및 상태 관리
- **TypeScript** — 전체 코드 엄격한 타입 적용
- **Tailwind CSS** — 유틸리티 우선 스타일링
- **Web Audio API** — 오디오 재생, 라우팅, 처리 (외부 오디오 라이브러리 없음)

## 기능

- 여러 오디오 트랙 동시 로드
- 트랙별 볼륨 및 패닝 컨트롤
- 전체 재생 / 정지 트랜스포트
- 각 트랙의 파형 표시

## 프로젝트 구조

```
src/
  components/       # React UI 컴포넌트 (Track, MixerBoard, WaveformDisplay 등)
  hooks/            # 커스텀 React 훅 (useAudioEngine, useTrack 등)
  audio/            # Web Audio API 래퍼 및 오디오 그래프 유틸리티
  types/            # 공유 TypeScript 인터페이스 및 타입
  utils/            # 순수 헬퍼 함수 (dB 변환, 시간 포맷 등)
```

## 개발 명령어

```bash
npm install       # 의존성 설치
npm run dev       # 개발 서버 시작
npm run build     # 프로덕션 빌드
npm run typecheck # tsc --noEmit 실행
npm run lint      # ESLint 실행
npm test          # 테스트 실행
```

## 아키텍처 설명

- Web Audio API 컨텍스트는 `useAudioEngine`이 관리하는 단일 `AudioContext` 인스턴스에 존재합니다. 모든 트랙 노드는 이 공유 컨텍스트를 통해 연결됩니다.
- 각 트랙은 마스터 출력 전에 직렬로 연결된 자체 `GainNode`(볼륨)와 `StereoPannerNode`(패닝)를 소유합니다.
- 파형 표시는 `requestAnimationFrame`을 통해 `AnalyserNode` 데이터를 읽습니다 — 렌더 루프를 블로킹하지 마세요.
- 오디오 파일은 `AudioContext.decodeAudioData`로 한 번 디코딩되어 `AudioBuffer`로 저장됩니다 — 재생 시 재디코딩을 피하세요.

## 주요 컨벤션

- TypeScript strict 모드 활성화 — `any` 사용 금지, 이유 없는 non-null assertion 금지.
- Tailwind만 사용 — 동적 오디오 구동 값(예: 파형 캔버스 크기)을 제외한 외부 CSS 파일이나 인라인 `style` props 사용 금지.
- 오디오 그래프를 구동하는 상태(볼륨, 패닝, 재생)는 반드시 동기화 — React 상태와 해당 Web Audio 노드 파라미터를 즉시 함께 업데이트해야 합니다.
- 컴포넌트에는 오디오 로직을 두지 않음 — 컴포넌트는 훅을 호출하고, 훅은 오디오 유틸리티를 호출합니다.
