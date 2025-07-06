function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  width = 'w-full',
  inputClassName = '',
  showTopLabel = true,
}) {
  return (
    <div className={`form-control ${width}`}>
      {showTopLabel && label && (
        <label className="mb-1 text-base font-semibold text-gray-700">
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        className={`input input-bordered input-sm ${inputClassName} ${className} 
        }`}
      />
    </div>
  );
}

export default InputField;
