'use client';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'date' | 'select' | 'file' | 'textarea';
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  note?: string;
  flagged?: boolean;
  flagRemark?: string;
}

export default function FormField({
  label, name, type = 'text', value = '', onChange, options,
  error, required = false, disabled = false, placeholder, maxLength, note,
  flagged, flagRemark
}: FormFieldProps) {
  const inputClass = `form-input ${error ? 'error' : ''} ${flagged ? '!border-orange-400 !bg-orange-50' : ''}`;

  return (
    <div className="animate-fade-in">
      <label className="form-label" htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      {note && <p className="text-xs text-slate-500 mb-1">{note}</p>}

      {flagged && flagRemark && (
        <div className="mb-2 p-2 bg-orange-50 border border-orange-300 rounded text-xs text-orange-800 flex gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span><strong>Admin Remark:</strong> {flagRemark}</span>
        </div>
      )}

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          className={inputClass}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={inputClass}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type === 'date' ? 'text' : type}
          className={inputClass}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || (type === 'date' ? 'dd/mm/yyyy' : '')}
          maxLength={maxLength}
        />
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
