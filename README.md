# SolidJS 찍어먹기

웹 개발은 React로만 하고있는 제가 SolidJS 라이브러리를 찍어먹어보며 배운 내용들을 정리해 봤습니다.

## 1. SolidJS의 배경과 특징

SolidJS는 React의 디자인 철학과 일치한다고 하지만, 가상 DOM을 사용하지 않고 직접 DOM 업데이트를 수행한다.
[js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/2025/table_chrome_136.0.7103.93.html) 기준, React 대비 엄청난 성능차이를 보여준다. 거의 Vanilla JS 수준이다.

React는 렌더링 시 React Fiber 알고리즘에 의해, 부모 컴포넌트에서 자식 컴포넌트로 하향식 render 메서드를 반복적으로 호출하지만, SolidJS는 렌더링 시 최초 한번만 수행하여 리액티브 그래프를 구성한 다음, 세분화된 변경과 관련된 명령을 수행한다고 한다.
- [문서](https://www.solidjs.com/guides/comparison)에서 참고

## 2. React와 SolidJS 비교

React에서 사용하는 패턴과 SolidJS가 거의 동일하며, 약간의 차이점만 존재한다.

| 개념 | React | SolidJS | 차이점 |
|------|-------|---------|-------|
| 상태 관리 | useState | createSignal | SolidJS는 getter 함수 반환 |
| 부수 효과 | useEffect | createEffect | 의존성 배열 vs 내부 시그널 감지 |
| 전역 상태 | Context API | createStore | Context 가 필수가 아니며, 결합을 원할 경우 사용 |
| 데이터 패칭 | 외부 라이브러리 권장 | createResource | 내장 기능 제공 |
| 렌더링 | - | - | 아래 별도 작성 |

### 렌더링 차이

React는 가상DOM을 거쳐 실제 DOM에 업데이트 되며, 이는 사용자 상호작용 이후 많은 변화가 존재할 때, 홀딩했다가 한번에 업데이트 하여 성능을 최적화 하는 방식이다.

SolidJS는 가상DOM을 사용하지 않는다. 직접 DOM을 조작하기 때문에 렌더링 시 최초 한번만 수행하여 리액티브 그래프를 구성한 다음, 세분화된 변경과 관련된 명령을 수행한다.

### Props 차이

**SolidJS는 한번만 실행된다.** 는 점에서 에서 주의할 점이 있다.

**컴포넌트 실행 방식:**
- React: 매 리렌더링마다 함수가 다시 실행된다.
- SolidJS: 최초 마운트시에만 한 번 실행된다.

**Props의 특성:**
- React: 매 리렌더링마다 함수 파라미터에 새로운 props 객체가 전달된다.
- SolidJS: 일반 객체가 아닌 **getter로 구성된 프록시 객체**이다. 각 prop은 SolidJS 내부의 `signal`이나 반응형 값에 연결되어 있다. 

**Props 접근 방식:**
- React: 구조 분해 할당을 통해 항상 최신의 props 값이 변수에 할당된다.
- SolidJS: `props.name` 으로 접근하면, getter가 호출되어 최신 값을 얻고, Solid의 반응형 시스템이 이 getter의 사용을 추적해 값이 바뀔 때마다 DOM을 자동으로 업데이트한다.

하지만 구조 분해 할당을 한다면

```js
const { name } = props;
```

이 시점에서 getter가 호출되어 현재 값이 일반 변수(name)에 복사된다. 이 변수는 더이상 반응형이 아니기 때문에, 이후 props가 변경되어도 name은 갱신되지 않는다.

```tsx
// SolidJS의 잘못된 예시
function Counter({ count }) {
  return <div>값: {count}</div>;
}

// 올바른 예시
const value = () => props.value || "default";
return <div>{value()}</div>;

// 비용이 많이 드는 
const value = createMemo(() => props.value || "default");

// 디폴트 props 지정이 필요한 경우
props = mergeProps({ name: "Smith" }, props);

// props 복제
const newProps = mergeProps(props);

// 다른 props 객체와 병합
props = mergeProps(props, otherProps);

// 분할이 필요한 경우
const [local, others] = splitProps(props, ["class"])
<div {...others} class={cx(local.class, theme.component)} />
```


### 2.1 상태 관리 코드 예시

둘의 성격이 비슷하나, SolidJS는 값을 참조하려면 getter 함수를 호출해야 한다.

**React:**
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>값: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

**SolidJS:**
```jsx
import { createSignal } from 'solid-js';

function Counter() {
  // createSignal은 getter 함수와 setter 함수를 반환한다.
  const [count, setCount] = createSignal(0);
  
  return (
    <div>
      <p>값: {count()}</p> {/* count는 함수로 호출해야 한다. */}
      <button onClick={() => setCount(count() + 1)}>증가</button>
    </div>
  );
}
```

### 2.2 부수 효과 코드 예시

React는 부수 효과를 처리하기 위해 `useEffect` 훅을 사용하며, 의존성 배열에 상태를 넣어서 `useEffect` 훅이 호출될 타이밍을 제어할 수 있다.  
SolidJS는 `createEffect` 함수를 사용하며, 의존성 배열이 없는 대신, 내부에서 사용된 `signal`이 변경되면 자동으로 실행된다.

**React:**
```jsx
import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // 의존성 배열을 빈 배열로 지정
  
  return <div>경과 시간: {seconds}초</div>;
}
```

**SolidJS:**
```jsx
import { createSignal, createEffect, onCleanup } from 'solid-js';

function Timer() {
  const [seconds, setSeconds] = createSignal(0);
  
  createEffect(() => {
    // createEffect는 내부에서 사용된 신호를 자동으로 추적한다.
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // 정리 함수는 onCleanup 으로 지정한다.
    onCleanup(() => clearInterval(interval));
  });
  
  return <div>경과 시간: {seconds()}초</div>;
}
```

## 3. JSX 사용 방식의 차이

SolidJS는 JSX를 사용하지만 조건부 렌더링과 리스트 렌더링 방식이 React와 다르다. SolidJS는 선언형 컴포넌트를 제공한다.

요즘 자주 들락하는 Frontend Fundamentals 에서, 커뮤니티 중 가장 핫한 [조건부 렌더링 처리, 다들 어떻게 처리하시나요?](https://frontend-fundamentals.com/code-quality/code/community/good-discussions.html#%F0%9F%8E%99%EF%B8%8F-%E1%84%8C%E1%85%A9%E1%84%80%E1%85%A5%E1%86%AB%E1%84%87%E1%85%AE-%E1%84%85%E1%85%A6%E1%86%AB%E1%84%83%E1%85%A5%E1%84%85%E1%85%B5%E1%86%BC-%E1%84%8E%E1%85%A5%E1%84%85%E1%85%B5-%E1%84%83%E1%85%A1%E1%84%83%E1%85%B3%E1%86%AF-%E1%84%8B%E1%85%A5%E1%84%84%E1%85%A5%E1%87%82%E1%84%80%E1%85%A6-%E1%84%8E%E1%85%A5%E1%84%85%E1%85%B5%E1%84%92%E1%85%A1%E1%84%89%E1%85%B5%E1%84%82%E1%85%A1%E1%84%8B%E1%85%AD)의 논리 연산자 vs 선언적 컴포넌트에서, 선언적 컴포넌트가 좋은 사람은 SolidJS가 마믐에 들 것 이다. 단, 토스 프론트헤드 박서진님이 작성해주신대로, JS에서 `Short-circuiting`이 보장되지 않는다.

### 3.1 조건부 렌더링

**React:**
```jsx
function Greeting({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <p>환영합니다!</p>
      ) : (
        <p>로그인해주세요</p>
      )}
    </div>
  );
}
```

**SolidJS:**
```jsx
import { Show, Switch, Match } from 'solid-js';

function Greeting(props) {
  return (
    <div>
      {/* Show 컴포넌트는 when 조건이 참일 때 children을, 
          거짓일 때 fallback을 렌더링 */}
      <Show
        when={props.isLoggedIn}
        fallback={<p>로그인해주세요</p>}
      >
        <p>환영합니다!</p>
      </Show>
      
      {/* 여러 조건이 필요한 경우 Switch와 Match 컴포넌트 사용 */}
      <Switch>
        <Match when={props.isAdmin}>
          <p>관리자님 환영합니다</p>
        </Match>
        <Match when={props.isUser}>
          <p>사용자님 환영합니다</p>
        </Match>
        <Match when={true}> {/* 기본 케이스 */}
          <p>손님입니다</p>
        </Match>
      </Switch>
    </div>
  );
}

// 컴파일 결과
_$createComponent(Switch, {
  get fallback() {
    return (() => {
      var _el$ = _$createElement("div");
      _$insertNode(_el$, _$createTextNode(`Not Found`));
      return _el$;
    })();
  },
  get children() {
    return [_$createComponent(Match, {
      get when() {
        return state.route === "home";
      },
      get children() {
        return _$createComponent(Home, {});
      }
    }), _$createComponent(Match, {
      get when() {
        return state.route === "settings";
      },
      get children() {
        return _$createComponent(Settings, {});
      }
    })];
  }
});
```

### 3.2 리스트 렌더링

**React:**
```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

**SolidJS:**
```jsx
import { For } from 'solid-js';

function TodoList(props) {
  return (
    <ul>
      <For each={props.todos}>
        {(todo) => <li>{todo.text}</li>}
      </For>
    </ul>
  );
}
```

## 4. SolidStart 프레임워크

SolidStart는 SolidJS 기반의 풀스택 웹 프레임워크로, Next.js와 유사한 기능을 제공한다.  
파일 기반 라우팅, SSR, CSR, 그리고 정적 사이트 생성을 지원한다.

### 4.1 기본 구조

```
├── src/
│ ├── routes/
│ │ ├── index.tsx # 홈 페이지
│ │ ├── about.tsx # /about 라우트
│ │ └── [...404].tsx # 404 페이지
│ ├── app.tsx # 애플리케이션 진입점. layout.tsx와 같은 역할을 한다.
│ ├── app.css # 애플리케이션 전역 스타일
│ ├── entry-server.ts # 서버 진입점
│ └── entry-client.ts # 클라이언트 진입점
├── public/
└── package.json
```

파일 기반 라우팅은 `src/routes` 디렉토리 내의 파일 구조를 기반으로 자동으로 라우트를 생성한다. 중첩 라우팅, 동적 라우팅, 레이아웃 등을 지원한다.

### 4.2 "use server"

Next.JS에서 App Routing 이후 등장한 서버 액션 문법이 SolidJS에서도 동일하게 지원된다. 이를 통해 클라이언트 컴포넌트에서 서버 함수를 직접 호출할 수 있다.

```tsx
// src/routes/todos/action.ts
"use server";

import fs from "fs";

export const serverAction = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 파일을 가져오거나,
  const packageJson = fs.readFileSync("package.json", "utf8");
  console.log("packageJson", packageJson);
  
  // DB에 접근해도 된다.
  await db.insert(todos).values({
    title: data.title,
    done: data.done,
  });

  console.log("서버 액션 데이터:", data);
};
```

클라이언트 컴포넌트에서는 이 함수를 일반 함수처럼 가져와 사용할 수 있으며, 실제 실행은 서버에서 이루어진다. Next.JS의 Server Actions를 생각하면 된다.

### 4.3 Hydration

SolidJS는 hydration 이후 코드가 다시 실행되지 않는다.
이는 React와 다른 동작 방식으로, React는 hydration 이후 이벤트 주입을 위해 전체 코드를 재실행 하는 방식과 다르다.

만일 `window` 객체에 접근해야할 코드가 있다면, React에선 조건문을 통해 `if(typeof window !== 'undefined')` 를 쓰면 되지만, SolidJS에선 그렇게하면 window에 접근할 수 없다.
대신, `clientOnly` 함수를 통해 클라이언트전용 컴포넌트임을 명시하여 사용해야만 한다.

**클라이언트 전용 코드 예시:**

```jsx
import { clientOnly } from '@solidjs/start';

// 클라이언트 전용 컴포넌트
const ClientOnlyComponent = clientOnly(() => {
  // 여기서는 안전하게 window 객체에 접근할 수 있음
  const width = window.innerWidth;
  return <div>화면 너비: {width}px</div>;
});

export default function Page() {
  return (
    <div>
      <h1>클라이언트 전용 컴포넌트</h1>
      <ClientOnlyComponent />
    </div>
  );
}
```

`clientOnly` 헬퍼 함수는 서버 사이드 렌더링 중에는 컴포넌트를 렌더링하지 않고, 클라이언트에서만 실행되도록 보장한다.

## 5. 고급 기능

### 5.1 Suspense와 비동기 처리

SolidJS는 React의 Suspense 패턴을 채택했지만, 더 깊게 통합되어 있습니다. `createResource`와 함께 사용하면 비동기 데이터 로딩을 선언적으로 처리할 수 있습니다.

```jsx
import { Suspense } from 'solid-js';
import { createResource } from 'solid-js';

// 데이터 페칭 함수
const fetchUserData = async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
};

function UserProfile(props) {
  // createResource는 비동기 데이터 소스를 추적 가능한 리소스로 변환합니다
  const [user] = createResource(() => props.id, fetchUserData);
  
  return (
    <div>
      <h2>{user()?.name || '로딩 중...'}</h2>
      <p>{user()?.email}</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <UserProfile id={1} />
    </Suspense>
  );
}
```

`createResource`는 데이터 소스와 페치 함수를 받아 비동기 데이터를 관리하며, `Suspense` 컴포넌트는 데이터 로딩 중에 대체 UI를 표시한다.

### 5.2 앞으로 학습할 주제

- **Head/metadata**: 검색엔진에 노출되기 위한 메타데이터 관리
- **Middleware**: 요청 처리 파이프라인 구성 및 관리
- **Session**: 사용자 세션 관리 및 인증 처리

## 나중에 해볼 것

- [ ] Hydration 관련 문제 해결
  - React도 Hydration 디버깅이 어려운데, SolidJS가 더 어렵다.
- [ ] Suspense와 비동기 작업 관리 방법 실습
- [ ] 메타데이터, 미들웨어, 세션 관리 학습

## 참고 자료

- [SolidJS 공식 문서](https://docs.solidjs.com/)
