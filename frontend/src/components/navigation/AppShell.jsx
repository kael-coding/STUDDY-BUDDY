import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/header/Navbar.jsx";
import WorkspaceSidebar from "@/components/navigation/WorkspaceSidebar.jsx";
import { workspaces } from "@/components/navigation/workspaceNav.js";
import { useAuthStore } from "@/store/authStore.js";
import { useNoteStore } from "@/store/noteStore.js";

export default function AppShell({ children, fullBleed = false }) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const getNotes = useNoteStore((state) => state.getNotes);
    const flaggedCount = useNoteStore((state) => state.notes.reduce((count, note) =>
        count + (note.isArchived || note.deletedAt ? 0 : note.flashcards?.filter((card) => card.reviewAgain).length ?? 0), 0));
    const workspace = workspaces[user.role] ?? workspaces.user;
    const navigate = useNavigate();
    const { pathname, hash, key } = useLocation();
    const content = useRef(null);
    const navigationDialog = useRef(null);
    const logoutDialog = useRef(null);
    const [navigationOpen, setNavigationOpen] = useState(false);
    const [logoutBusy, setLogoutBusy] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    useEffect(() => {
        if (user.role === "user" && !useNoteStore.getState().notes.length && !useNoteStore.getState().isLoading) getNotes();
    }, [getNotes, user._id, user.role]);

    useEffect(() => {
        const target = hash && document.getElementById(hash.slice(1));
        if (target && content.current?.contains(target)) {
            target.tabIndex = -1;
            target.focus({ preventScroll: true });
            target.scrollIntoView({ block: "start" });
        }
    }, [hash, key]);

    useEffect(() => {
        if (!hash) {
            content.current?.scrollTo(0, 0);
        }
    }, [pathname, hash]);

    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 64rem)");
        const closeOnDesktop = () => {
            if (desktop.matches) navigationDialog.current?.close();
        };
        desktop.addEventListener("change", closeOnDesktop);
        return () => desktop.removeEventListener("change", closeOnDesktop);
    }, []);

    const closeNavigation = () => navigationDialog.current?.close();
    const openLogout = () => {
        closeNavigation();
        setLogoutError("");
        logoutDialog.current?.showModal();
    };
    const confirmLogout = async () => {
        setLogoutBusy(true);
        setLogoutError("");
        try {
            await logout();
            navigate("/", { replace: true });
        } catch {
            setLogoutError("Could not log out. Try again.");
            setLogoutBusy(false);
        }
    };

    const sidebarProps = { workspace, role: user.role, flaggedCount, onLogout: openLogout };

    return (
        <div className="flex h-dvh overflow-hidden bg-[#f8faf9] text-[#1f3430]">
            <aside className="hidden w-60 shrink-0 lg:block">
                <WorkspaceSidebar {...sidebarProps} />
            </aside>
            <dialog ref={navigationDialog} aria-label="Workspace navigation"
                onClose={() => setNavigationOpen(false)}
                onClick={(event) => { if (event.target === event.currentTarget) closeNavigation(); }}
                className="fixed inset-0 m-0 h-dvh max-h-none w-[min(17rem,85vw)] max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-[#1f3430]/50">
                <WorkspaceSidebar {...sidebarProps} onClose={closeNavigation} onNavigate={closeNavigation} />
            </dialog>
            <div className="flex min-w-0 flex-1 flex-col">
                <Navbar key={pathname} user={user} workspace={workspace} navigationOpen={navigationOpen} onLogout={openLogout}
                    onOpenNavigation={() => {
                        navigationDialog.current?.showModal();
                        setNavigationOpen(true);
                    }} />
                <main ref={content} className={`min-h-0 min-w-0 flex-1 ${fullBleed ? "overflow-hidden" : "overflow-auto p-4 sm:px-6 lg:px-8"}`}>
                    {children}
                </main>
            </div>
            <dialog ref={logoutDialog} aria-labelledby="logout-title" onCancel={(event) => {
                if (logoutBusy) event.preventDefault();
            }} className="m-auto w-[min(25rem,calc(100%-2rem))] rounded-xl bg-white p-6 text-[#1f3430] shadow-lg backdrop:bg-[#1f3430]/50">
                <h2 id="logout-title" className="text-lg font-semibold">Log out of Study Buddy?</h2>
                {logoutError && <p role="alert" className="mt-2 text-sm text-red-700">{logoutError}</p>}
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" disabled={logoutBusy} onClick={() => logoutDialog.current?.close()}
                        className="rounded-lg border border-[#dce7e1] px-4 py-2 text-sm font-semibold disabled:opacity-60">Cancel</button>
                    <button type="button" disabled={logoutBusy} onClick={confirmLogout}
                        className="rounded-lg bg-[#365e53] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                        {logoutBusy ? "Logging out…" : "Log Out"}
                    </button>
                </div>
            </dialog>
        </div>
    );
}
