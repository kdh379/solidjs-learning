import type { JSX } from "solid-js";
import { splitProps, createSignal, mergeProps } from "solid-js";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const checkboxVariants = cva("checkbox", {
  variants: {
    intent: {
      primary: "checkbox-primary",
      secondary: "checkbox-secondary",
      accent: "checkbox-accent",
      info: "checkbox-info",
      success: "checkbox-success",
      warning: "checkbox-warning",
      error: "checkbox-error",
      neutral: "checkbox-neutral",
    },
    sizing: {
      xs: "checkbox-xs",
      sm: "checkbox-sm",
      md: "checkbox-md",
      lg: "checkbox-lg",
      xl: "checkbox-xl",
    },
    variant: {
      bordered: "checkbox-bordered",
      mark: "checkbox-mark",
    },
    shape: {
      square: "",
      circle: "rounded-full",
    },
    isDisabled: {
      true: "checkbox-disabled",
    },
  },
  defaultVariants: {
    intent: "neutral",
    sizing: "md",
    shape: "square",
  },
});

// HTML input 속성에서 size와 type 제외하고 확장
type CheckboxHTMLAttributesCustom = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "onChange"
>;

interface CheckboxProps
  extends CheckboxHTMLAttributesCustom,
    VariantProps<typeof checkboxVariants> {
  /** 체크박스 레이블 (자식 요소로 전달) */
  children?: JSX.Element;
  /** 레이블 위치 */
  labelPlacement?: "right" | "left";
  /** 오류 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 중간 상태 (일부 선택) */
  indeterminate?: boolean;
  /** 체크박스 기본값 */
  checked?: boolean;
  /** 기본 체크 상태 */
  defaultChecked?: boolean;
  /** 체크 상태가 변경될 때 호출되는 함수 */
  onChange?: (checked: boolean) => void;
}

export function Checkbox(props: CheckboxProps) {
  const defaultProps = {
    labelPlacement: "right" as const,
    defaultChecked: false,
  };

  const merged = mergeProps(defaultProps, props);

  const [local, others] = splitProps(merged, [
    "class",
    "intent",
    "sizing",
    "variant",
    "shape",
    "isDisabled",
    "children",
    "labelPlacement",
    "error",
    "helperText",
    "indeterminate",
    "ref",
    "disabled",
    "checked",
    "defaultChecked",
    "onChange",
  ]);

  // 내부 체크 상태 (controlled 또는 uncontrolled)
  const [internalChecked, setInternalChecked] = createSignal(
    local.checked !== undefined ? local.checked : local.defaultChecked,
  );

  // ref가 설정되어 있을 경우 indeterminate 상태 업데이트
  const handleRef = (el: HTMLInputElement) => {
    if (typeof local.ref === "function") {
      local.ref(el);
    }
    if (local.indeterminate !== undefined) {
      el.indeterminate = local.indeterminate;
    }
  };

  // 체크박스 변경 이벤트 핸들러
  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const newChecked = target.checked;

    // uncontrolled 모드일 때만 내부 상태 변경
    if (local.checked === undefined) {
      setInternalChecked(newChecked);
    }

    // 상태 변경 콜백 호출
    if (local.onChange) {
      local.onChange(newChecked);
    }
  };

  // 레이블 배치에 따른 컨테이너 클래스
  const containerClass = () => {
    const base = "flex items-center gap-2";
    return local.labelPlacement === "left" ? `${base} flex-row-reverse` : base;
  };

  return (
    <div class="flex flex-col gap-1">
      <div class={containerClass()}>
        <input
          {...others}
          ref={handleRef}
          type="checkbox"
          disabled={local.disabled}
          checked={
            local.checked !== undefined ? local.checked : internalChecked()
          }
          onChange={handleChange}
          class={checkboxVariants({
            intent: local.intent,
            sizing: local.sizing,
            variant: local.variant,
            shape: local.shape,
            isDisabled: local.disabled ? true : undefined,
            class: `${local.error ? "checkbox-error" : ""} ${local.class || ""}`,
          })}
          aria-invalid={local.error ? "true" : undefined}
          aria-describedby={
            local.helperText || local.error
              ? `${others.id}-description`
              : undefined
          }
        />

        {local.children && (
          <label
            for={others.id}
            class={`text-sm ${local.disabled ? "opacity-60" : ""} ${
              local.error ? "text-error" : "text-base-content"
            }`}
          >
            {local.children}
          </label>
        )}
      </div>

      {(local.helperText || local.error) && (
        <p
          id={others.id ? `${others.id}-description` : undefined}
          class={`text-xs ${
            local.error ? "text-error" : "text-base-content/70"
          }`}
        >
          {local.error || local.helperText}
        </p>
      )}
    </div>
  );
}
