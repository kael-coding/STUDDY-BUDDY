import PropTypes from 'prop-types';

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
                className="text-xs md:text-sm font-medium text-gray-800"
            >
                {label}:
            </label>
            <div className="relative flex items-center">
                {icon && (
                    <span className="absolute left-3 text-gray-500">
                        {icon}
                    </span>
                )}

                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md md:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 text-sm bg-white"
                />

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

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    icon: PropTypes.node,
    toggleIcon: PropTypes.node,
    onToggle: PropTypes.func,
};

export default InputField;