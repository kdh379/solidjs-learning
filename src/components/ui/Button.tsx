import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const buttonVariants = cva("btn", {
  variants: {
    intent: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      info: "btn-info",
      success: "btn-success",
      warning: "btn-warning",
      error: "btn-error",
      neutral: "btn-neutral",
    },
    size: {
      xs: "btn-xs",
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
      xl: "btn-xl",
    },
    variant: {
      outline: "btn-outline",
      dash: "btn-dash",
      soft: "btn-soft",
      ghost: "btn-ghost",
      link: "btn-link",
    },
    shape: {
      wide: "btn-wide",
      block: "btn-block",
      square: "btn-square",
      circle: "btn-circle",
    },
    isIconOnly: {
      true: "aspect-square p-0",
    },
  },
  defaultVariants: {
    intent: "neutral",
    size: "md",
  },
});

interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "intent",
    "size",
    "variant",
    "shape",
    "isIconOnly",
  ]);

  return (
    <button
      {...others}
      class={buttonVariants({
        intent: local.intent,
        size: local.size,
        variant: local.variant,
        shape: local.shape,
        class: local.class,
        isIconOnly: local.isIconOnly,
      })}
    >
      {local.children}
    </button>
  );
}
