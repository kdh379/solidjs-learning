import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { serverAction } from "~/routes/form-validation/action";

type FormControlElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

interface FieldConfig {
  element: FormControlElement;
  validators: ((element: FormControlElement) => Promise<string>)[];
}

interface FormFields {
  [key: string]: FieldConfig;
}

function checkValid(
  { element, validators = [] }: FieldConfig,
  setErrors: (errors: Record<string, string | undefined>) => void,
) {
  return async () => {
    // input 요소의 커스텀 유효성 메시지를 초기화합니다
    element.setCustomValidity("");

    // 먼저 브라우저 기본 유효성 검사 실행
    element.checkValidity();
    let message = element.validationMessage;

    // 커스텀 유효성 검사는 브라우저 기본 메시지가 없을 때만 실행
    if (!message && validators.length > 0) {
      for (const validator of validators) {
        const text = await validator(element);
        if (text) {
          element.setCustomValidity(text);
          break;
        }
      }
      message = element.validationMessage;
    }

    if (message) {
      setErrors({ [element.name]: message });
      return false;
    } else {
      setErrors({ [element.name]: undefined });
      return true;
    }
  };
}

function createForm<T extends object>() {
  const [errors, setErrors] = createStore<Record<string, string | undefined>>(
    {},
  );
  const [fields, setFields] = createStore<FormFields>({});
  const [isDirty, setIsDirty] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const register = (
    name: string,
    options: {
      required?: boolean;
      pattern?: RegExp;
      validate?: (value: string) => string | boolean;
    } = {},
  ) => {
    return {
      ref: (ref: FormControlElement) => {
        setFields((fields) => ({
          ...fields,
          [name]: { element: ref, validators: [] },
        }));
        return ref;
      },
      name,
      required: options.required ? true : undefined,
      pattern: options.pattern ? options.pattern.toString() : undefined,
      onInput: (_: InputEvent) => {
        if (errors[name]) {
          setErrors({ [name]: undefined });
        }
        setIsDirty(true);
      },
      onBlur: (e: FocusEvent) => {
        const target = e.target as HTMLInputElement;

        // 유효성 검사 실행
        checkValid(
          {
            element: target,
            validators: fields[name]?.validators || [],
          },
          setErrors,
        )();
      },
    };
  };

  const getValues = (name?: string) => {
    if (name) {
      return fields[name]?.element.value;
    }
    return Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value.element.value]),
    );
  };

  const handleSubmit = (onSubmit: (data: T) => Promise<void>) => {
    return async (e: SubmitEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // 폼 데이터 수집 및 유효성 검사
      let hasErrors = false;

      // noValidate를 이용하여 브라우저의 기본 툴팁 등장을 방지하기 위해
      // 폼 요소에 직접 접근하여 noValidate 속성을 설정
      const form = e.target as HTMLFormElement;
      const originalNoValidate = form.noValidate;
      form.noValidate = true;

      // 모든 필드를 검사하여 유효성 여부 확인
      const validationPromises = Object.entries(fields).map(
        async ([fieldName, field]) => {
          // 커스텀 유효성 검사 메시지 초기화
          field.element.setCustomValidity("");

          // 필드의 유효성 검사 수행
          const isValid = await checkValid(field, setErrors)();

          if (!isValid) {
            hasErrors = true;
            return { fieldName, isValid: false };
          }

          return { fieldName, isValid: true };
        },
      );

      const results = await Promise.all(validationPromises);

      // noValidate 속성을 원래 상태로 복원
      form.noValidate = originalNoValidate;

      // 첫 번째 오류가 있는 필드에 포커스
      const firstErrorField = results.find((result) => !result.isValid);
      if (firstErrorField) {
        fields[firstErrorField.fieldName].element.focus();
      }

      if (hasErrors) {
        setIsSubmitting(false);
        return;
      }

      try {
        await onSubmit(getValues() as T);
      } finally {
        setIsSubmitting(false);
      }
    };
  };

  return {
    errors,
    register,
    getValues,
    handleSubmit,
    isDirty,
    isSubmitting,
  };
}

export default function FormValidation() {
  const { register, handleSubmit, errors, isSubmitting } = createForm();

  const onSubmit = async (data: any) => {
    await serverAction(data);
  };

  return (
    <main class="flex h-screen flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold">폼 유효성 검사 예제</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="이름"
          type="text"
          error={errors.name}
          {...register("name", { required: true })}
        />

        <Input
          label="이메일"
          type="email"
          error={errors.email}
          {...register("email", {
            required: true,
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          })}
        />

        <Button type="submit" intent="primary" disabled={isSubmitting()}>
          제출
        </Button>
      </form>
    </main>
  );
}
