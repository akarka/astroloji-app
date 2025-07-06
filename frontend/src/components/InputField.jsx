function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  width = "w-full",
  inputClassName = "",
  showTopLabel = true,
  required = false,
}) {
  return (
    <div className={`${width}`}>
      {showTopLabel && label && (
        <label className="block mb-2 text-sm font-medium text-white">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        className={`w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${inputClassName} ${className}`}
      />
    </div>
  );
}

export default InputField;
