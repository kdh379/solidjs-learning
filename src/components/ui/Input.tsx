import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const inputVariants = cva("input", {
  variants: {
    intent: {
      primary: "input-primary",
      secondary: "input-secondary",
      accent: "input-accent",
      info: "input-info",
      success: "input-success",
      warning: "input-warning",
      error: "input-error",
      neutral: "input-neutral",
    },
    sizing: {
      xs: "input-xs",
      sm: "input-sm",
      md: "input-md",
      lg: "input-lg",
      xl: "input-xl",
    },
    variant: {
      bordered: "input-bordered",
      ghost: "input-ghost",
    },
    state: {
      disabled: "input-disabled",
      focused: "focus:ring-2 focus:ring-opacity-50",
    },
    shape: {
      full: "w-full",
    },
  },
  defaultVariants: {
    intent: "neutral",
    sizing: "md",
    variant: "bordered",
  },
});

// HTML input 속성에서 size와 prefix 제외하고 확장
type InputHTMLAttributesCustom = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
>;

interface InputProps
  extends InputHTMLAttributesCustom,
    VariantProps<typeof inputVariants> {
  /** 입력 필드 레이블 */
  label?: string;
  /** 레이블 위치 */
  labelPlacement?: "top" | "left" | "inside";
  /** 오류 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 접두 아이콘/요소 */
  prefix?: JSX.Element;
  /** 접미 아이콘/요소 */
  suffix?: JSX.Element;
}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, [
    "class",
    "intent",
    "sizing",
    "variant",
    "state",
    "shape",
    "label",
    "labelPlacement",
    "error",
    "helperText",
    "prefix",
    "suffix",
  ]);

  // 레이블 배치에 따른 컨테이너 클래스
  const containerClass = () => {
    switch (local.labelPlacement) {
      case "left":
        return "flex items-center gap-2";
      case "inside":
        return "relative";
      case "top":
      default:
        return "flex flex-col gap-1";
    }
  };

  return (
    <div class={containerClass()}>
      {local.label && local.labelPlacement !== "inside" && (
        <label
          class={`text-sm font-medium ${
            local.error ? "text-error" : "text-base-content"
          }`}
        >
          {local.label}
        </label>
      )}

      <div class="relative">
        {local.prefix && (
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {local.prefix}
          </div>
        )}

        <input
          {...others}
          class={inputVariants({
            intent: local.intent,
            sizing: local.sizing,
            variant: local.variant,
            state: local.state,
            shape: local.shape,
            class: `${local.prefix ? "pl-10" : ""} ${
              local.suffix ? "pr-10" : ""
            } ${local.error ? "input-error" : ""} ${local.class || ""}`,
          })}
          aria-invalid={local.error ? "true" : undefined}
          aria-describedby={
            local.helperText || local.error
              ? `${others.id}-description`
              : undefined
          }
          placeholder={
            local.labelPlacement === "inside" ? local.label : others.placeholder
          }
        />

        {local.suffix && (
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {local.suffix}
          </div>
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
