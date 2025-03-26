import { clsx } from "clsx";
import { forwardRef, useCallback, useState } from "react";
import { HexColorPicker } from "react-colorful";

export interface FormFieldProps {
  label?: string;
  name: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "tel"
    | "textarea"
    | "select"
    | "checkbox"
    | "date"
    | "multiselect"
    | "colorpicker";
  value?: string | number | boolean | string[];
  onChange: (value: string | number | boolean | string[]) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  validateOnBlur?: boolean;
  customValidation?: (value: string) => string | undefined;
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(
  (
    {
      label,
      name,
      type = "text",
      value,
      onChange,
      error,
      helpText,
      required = false,
      placeholder,
      disabled = false,
      className = "",
      min,
      max,
      step,
      options = [],
      prefix,
      suffix,
      tooltip,
      validateOnBlur = true,
      customValidation,
    },
    ref,
  ) => {
    const [showColorPicker, setShowColorPicker] = useState(false);

    const handleChange = useCallback(
      (
        e:
          | React.ChangeEvent<
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >
          | string,
      ) => {
        let newValue: string | number | boolean | string[] =
          typeof e === "string" ? e : e.target.value;

        if (type === "number") {
          newValue = newValue === "" ? "" : Number(newValue);
          if (isNaN(newValue as number)) newValue = "";
        }

        if (type === "checkbox") {
          if (options && options.length > 0) {
            // Handle multi-checkbox
            const currentValues = (
              Array.isArray(value) ? value : []
            ) as string[];
            const clickedValue = typeof e === "string" ? e : e.target.value;
            if (
              typeof e !== "string" &&
              (e.target as HTMLInputElement).checked
            ) {
              newValue = [...currentValues, clickedValue];
            } else {
              newValue = currentValues.filter((v) => v !== clickedValue);
            }
          } else {
            // Handle single checkbox
            newValue =
              typeof e !== "string" && (e.target as HTMLInputElement).checked;
          }
        }

        if (type === "select") {
          if (
            typeof e !== "string" &&
            (e.target as HTMLSelectElement).multiple
          ) {
            const select = e.target as HTMLSelectElement;
            newValue = Array.from(select.selectedOptions).map(
              (opt) => opt.value,
            );
          } else {
            newValue = typeof e === "string" ? e : e.target.value;
          }
        }

        onChange(newValue);
      },
      [onChange, options, type, value],
    );

    const handleBlur = useCallback(() => {
      if (validateOnBlur && customValidation && typeof value === "string") {
        const validationError = customValidation(value);
        if (validationError) {
          console.error(validationError);
        }
      }
    }, [validateOnBlur, customValidation, value]);

    const inputClasses = clsx(
      "block w-full rounded-md border-gray-300 shadow-sm",
      "focus:border-blue-500 focus:ring-blue-500",
      "disabled:bg-gray-100 disabled:cursor-not-allowed",
      error && "border-red-300 text-red-900 placeholder-red-300",
      "sm:text-sm",
      className,
    );

    const renderInput = () => {
      if (type === "colorpicker") {
        return (
          <div className="relative">
            <div
              className="w-12 h-8 border rounded cursor-pointer"
              style={{ backgroundColor: (value as string) || "#ffffff" }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="absolute z-10 mt-2">
                <div
                  className="fixed inset-0"
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="relative">
                  <HexColorPicker
                    color={(value as string) || "#ffffff"}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
        );
      }

      if (type === "textarea") {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={name}
            name={name}
            value={value as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={clsx(
              "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              error && "ring-red-300 focus:ring-red-500",
              disabled && "bg-gray-50 text-gray-500",
              className,
            )}
            disabled={disabled}
            placeholder={placeholder}
            rows={4}
          />
        );
      }

      if (type === "select") {
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={name}
            name={name}
            value={value as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={clsx(
              "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              error && "ring-red-300 focus:ring-red-500",
              disabled && "bg-gray-50 text-gray-500",
              className,
            )}
            disabled={disabled}
            multiple={type === "multiselect"}
          >
            {!type.includes("multi") && (
              <option value="">{placeholder || "Select..."}</option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (type === "checkbox") {
        if (options && options.length > 0) {
          // Render multiple checkboxes for multi-select
          const selectedValues = (
            Array.isArray(value) ? value : []
          ) as string[];
          return (
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex items-center mr-4"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    onChange={handleChange}
                    className={clsx(
                      "h-4 w-4 rounded border-gray-300 text-blue-600",
                      "focus:ring-blue-500",
                      "disabled:opacity-50",
                    )}
                    disabled={disabled}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          );
        }
        // Single checkbox
        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={name}
            type="checkbox"
            name={name}
            checked={value as boolean}
            onChange={handleChange}
            onBlur={handleBlur}
            className={clsx(
              "h-4 w-4 rounded border-gray-300 text-blue-600",
              "focus:ring-blue-500",
              "disabled:opacity-50",
              error && "border-red-300",
              disabled && "bg-gray-100",
              className,
            )}
            disabled={disabled}
          />
        );
      }

      return (
        <div className="relative rounded-md shadow-sm">
          {prefix && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            </div>
          )}
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={name}
            type={type}
            name={name}
            value={value as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={clsx(
              "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              error && "ring-red-300 focus:ring-red-500",
              disabled && "bg-gray-50 text-gray-500",
              prefix && "pl-7",
              suffix && "pr-12",
              className,
            )}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
          />
          {suffix && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">{suffix}</span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={name}
            className={clsx(
              "block text-sm font-medium leading-6",
              error ? "text-red-500" : "text-gray-900",
              disabled && "text-gray-500",
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {tooltip && (
              <span className="ml-1 text-gray-500 hover:text-gray-700">ⓘ</span>
            )}
          </label>
        )}
        {renderInput()}
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
        {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
