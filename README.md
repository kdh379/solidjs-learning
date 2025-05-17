# DaisyUI 열대 테마 (Tropical Theme)

밝고 생동감 있는 열대 색상 팔레트로 구성된 DaisyUI 5의 커스텀 라이트 테마입니다.

## 주요 색상

- **Primary**: 터쿠아즈 - 열대 바다의 청량한 색상
- **Secondary**: 라임 그린 - 열대 숲의 신선한 녹색
- **Accent**: 코랄 - 열대 산호초의 따뜻한 붉은색
- **Base**: 크림 - 모래해변을 연상시키는 밝은 베이지

## 테마 적용 방법

### 1. CSS 파일 가져오기

DaisyUI를 설치하고 `tropical-theme.css` 파일을 프로젝트에 추가하세요.

```bash
npm install daisyui
```

### 2. HTML에 테마 적용

HTML 문서의 `<html>` 태그에 `data-theme="tropical"` 속성을 추가하세요:

```html
<html lang="ko" data-theme="tropical">
```

또는 JavaScript로 테마를 적용할 수 있습니다:

```javascript
document.documentElement.setAttribute("data-theme", "tropical");
```

### 3. 로컬 스토리지를 통한 테마 저장

사용자의 테마 선택을 저장하려면:

```javascript
// 테마 저장
localStorage.setItem("theme", "tropical");

// 테마 로드
try {
  document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "tropical");
} catch (e) {}
```

## 테마 전환 컨트롤러

DaisyUI의 `theme-controller` 클래스를 사용하여 테마 전환 컨트롤러를 쉽게 구현할 수 있습니다:

```html
<label class="swap swap-rotate">
  <input type="checkbox" value="dark" class="theme-controller" />
  
  <!-- 태양 아이콘 (라이트 모드) -->
  <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- SVG 경로 -->
  </svg>
  
  <!-- 달 아이콘 (다크 모드) -->
  <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- SVG 경로 -->
  </svg>
</label>
```

## 커스터마이징

`tropical-theme.css` 파일을 원하는 대로 수정하여 테마를 커스터마이징할 수 있습니다. OKLCH 색상 값을 조정하여 더 밝거나 어두운 색상을 만들 수 있습니다.

```css
@plugin "daisyui/theme" {
  name: "mytheme";
  
  /* 색상 커스터마이징 */
  --color-primary: oklch(68% 0.25 180); /* 터쿠아즈 */
  --color-secondary: oklch(75% 0.2 120); /* 라임 그린 */
  /* 더 많은 색상 커스터마이징... */
}
```

## 데모 페이지

`tropical-theme-example.html` 파일을 열어 이 테마의 다양한 컴포넌트를 확인하세요.

## 라이선스

MIT 라이선스
