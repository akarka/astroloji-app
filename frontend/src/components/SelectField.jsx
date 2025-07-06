function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  className = "",
  width = "w-full",
  showTopLabel = true,
}) {
  return (
    <div className={`${width}`}>
      {showTopLabel && label && (
        <label className="block mb-2 text-sm font-medium text-white">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${className}`}
      >
        <option value="" className="bg-gray-800 text-white">
          {label || "Seçiniz"}
        </option>
        {options.map((opt) => (
          <option
            key={opt.id}
            value={opt.id}
            className="bg-gray-800 text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
