import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputField({ label, type = "text", hint, ...props }) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const password = type === "password";

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
            <div className="relative">
                <input {...props} id={id} type={visible && password ? "text" : type}
                    aria-describedby={hint ? id + "-hint" : undefined}
                    className={`min-h-12 w-full rounded-lg border border-[#b1c4bb] bg-white/60 px-3 py-2.5 text-sm placeholder:text-[#647a73] ${password ? "pr-11" : ""}`} />
                {password && (
                    <button type="button" onClick={() => setVisible(!visible)}
                        aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
                        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-lg text-[var(--landing-deep)]">
                        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                )}
            </div>
            {hint && <p id={id + "-hint"} className="mt-1 text-xs text-[var(--landing-muted)]">{hint}</p>}
        </div>
    );
}
