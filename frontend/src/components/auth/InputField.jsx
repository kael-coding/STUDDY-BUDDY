const InputField = ({ label, type, name, value, onChange, placeholder, icon, toggleIcon, onToggle }) => {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">{label}:</label>
            <div className="relative flex items-center">
                {icon && <span className="absolute left-3">{icon}</span>}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {toggleIcon && (
                    <button type="button" onClick={onToggle} className="absolute right-3">
                        {toggleIcon}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InputField;
