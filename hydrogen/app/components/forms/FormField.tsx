import React from 'react';
import {Input, type InputProps} from './Input';
import {Textarea, type TextareaProps} from './Textarea';
import {Select, type SelectProps} from './Select';
import {Checkbox, type CheckboxProps} from './Checkbox';
import {RadioGroup, type RadioGroupProps} from './Radio';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

interface BaseFormFieldProps {
  /** Field name */
  name: string;
  /** Field type determines which component to render */
  type?: FormFieldType;
  /** Additional wrapper CSS classes */
  className?: string;
}

// Props when type is textarea
interface FormFieldTextareaProps extends BaseFormFieldProps {
  type: 'textarea';
  textareaProps?: Omit<TextareaProps, 'name'>;
}

// Props when type is select
interface FormFieldSelectProps extends BaseFormFieldProps {
  type: 'select';
  selectProps: Omit<SelectProps, 'name'>;
}

// Props when type is checkbox
interface FormFieldCheckboxProps extends BaseFormFieldProps {
  type: 'checkbox';
  checkboxProps?: Omit<CheckboxProps, 'name'>;
}

// Props when type is radio
interface FormFieldRadioProps extends BaseFormFieldProps {
  type: 'radio';
  radioProps: Omit<RadioGroupProps, 'name'>;
}

// Props for text-based inputs
interface FormFieldInputProps extends BaseFormFieldProps {
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date';
  inputProps?: Omit<InputProps, 'name' | 'type'>;
}

export type FormFieldProps =
  | FormFieldTextareaProps
  | FormFieldSelectProps
  | FormFieldCheckboxProps
  | FormFieldRadioProps
  | FormFieldInputProps;

/**
 * FormField component - migrated from theme/snippets/form-item.liquid
 *
 * A polymorphic form field component that renders the appropriate input type.
 *
 * @example
 * <FormField
 *   name="email"
 *   type="email"
 *   inputProps={{ label: 'Email', required: true }}
 * />
 *
 * @example
 * <FormField
 *   name="message"
 *   type="textarea"
 *   textareaProps={{ label: 'Message', rows: 5 }}
 * />
 *
 * @example
 * <FormField
 *   name="country"
 *   type="select"
 *   selectProps={{
 *     label: 'Country',
 *     options: [{ value: 'us', label: 'United States' }]
 *   }}
 * />
 */
export function FormField(props: FormFieldProps) {
  const {name, type = 'text', className} = props;

  const wrapperClasses = ['form-field', className].filter(Boolean).join(' ');

  if (type === 'textarea') {
    const {textareaProps} = props as FormFieldTextareaProps;
    return (
      <div className={wrapperClasses}>
        <Textarea name={name} {...textareaProps} />
      </div>
    );
  }

  if (type === 'select') {
    const {selectProps} = props as FormFieldSelectProps;
    return (
      <div className={wrapperClasses}>
        <Select name={name} {...selectProps} />
      </div>
    );
  }

  if (type === 'checkbox') {
    const {checkboxProps} = props as FormFieldCheckboxProps;
    return (
      <div className={wrapperClasses}>
        <Checkbox name={name} {...checkboxProps} />
      </div>
    );
  }

  if (type === 'radio') {
    const {radioProps} = props as FormFieldRadioProps;
    return (
      <div className={wrapperClasses}>
        <RadioGroup name={name} {...radioProps} />
      </div>
    );
  }

  // Default: text-based input types
  const {inputProps} = props as FormFieldInputProps;
  return (
    <div className={wrapperClasses}>
      <Input name={name} type={type} {...inputProps} />
    </div>
  );
}

export default FormField;
