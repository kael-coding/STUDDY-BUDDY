const InputField = ({
    label,
    type,
    name,
    value,
    onChange,
    placeholder,
    icon,
    toggleIcon,
    onToggle,
}) => {
    return (
        <div className="flex flex-col space-y-1">
            <label
                htmlFor={name}
                className="text-sm font-medium text-gray-800"
            >
                {label}:
            </label>
            <div className="relative flex items-center">
                {/* Icon on the left */}
                {icon && (
                    <span className="absolute left-3 text-gray-500">
                        {icon}
                    </span>
                )}

                {/* Input field */}
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 text-sm bg-white"
                />

                {/* Toggle icon (for password show/hide) */}
                {toggleIcon && (
                    <button
                        type="button"
                        onClick={onToggle}
                        className="absolute right-3 text-gray-500 hover:text-gray-700"
                    >
                        {toggleIcon}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InputField;
