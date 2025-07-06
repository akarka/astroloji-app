function SelectField({
  label,
  value,
  onChange,
  options = [],
  className = '',
  width = 'w-full',
  showTopLabel = true,
}) {
  return (
    <div className={`form-control ${width}`}>
      {showTopLabel && label && (
        <label className="mb-1 text-base font-semibold text-gray-700">
          <span className="label-text">{label}</span>
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`select select-bordered select-sm ${className}`}
      >
        <option value="">{label || 'Seçiniz'}</option>
        {options.map((opt) => (
          <option
            key={opt.id}
            value={opt.id}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
