import { LogOut, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/landing/LandingElements.jsx";
import { matchesWorkspaceLink } from "@/components/navigation/workspaceNav.js";
import { homeForRole } from "@/lib/homeForRole.js";

export default function WorkspaceSidebar({ workspace, role, flaggedCount, onNavigate, onClose, onLogout }) {
    const { pathname, hash } = useLocation();

    return (
        <div className="flex h-full min-h-0 flex-col bg-[#467467] text-white">
            <div className="flex items-start justify-between gap-1 px-4 pb-4 pt-5">
                <div>
                    <Link to={homeForRole(role)} onClick={onNavigate}><Logo light /></Link>
                    <p className="mt-1 pl-[50px] text-xs text-white/90">{workspace.subtitle}</p>
                </div>
                {onClose && (
                    <button type="button" onClick={onClose} aria-label="Close navigation" className="shrink-0 rounded-lg p-2 hover:bg-white/10">
                        <X size={19} aria-hidden="true" />
                    </button>
                )}
            </div>
            <nav aria-label="Workspace" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2">
                {workspace.sections.map(({ title, items }) => (
                    <div key={title} className="mb-4">
                        <h2 className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-widest text-white/85">{title}</h2>
                        <ul className="space-y-0.5">
                            {items.map((item) => {
                                const { to, label, Icon, badge } = item;
                                const active = matchesWorkspaceLink(to, pathname, hash);
                                return (
                                    <li key={to}>
                                        <Link to={to} onClick={onNavigate} aria-current={active ? (to.includes("#") ? "location" : "page") : undefined}
                                            className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-[#c8d7d1] font-semibold text-[#1f3430]" : "text-white hover:bg-white/10"}`}>
                                            <Icon size={18} className="shrink-0" aria-hidden="true" />
                                            <span className="flex-1">{label}</span>
                                            {badge === "flagged" && flaggedCount > 0 && (
                                                <span aria-label={`${flaggedCount} cards to review again`} className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[#365e53] px-1.5 text-xs font-semibold text-white">
                                                    {flaggedCount}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
            <div className="border-t border-white/20 px-3 py-2">
                <button type="button" onClick={onLogout} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm hover:bg-white/10">
                    <LogOut size={18} aria-hidden="true" /> Log Out
                </button>
            </div>
        </div>
    );
}
