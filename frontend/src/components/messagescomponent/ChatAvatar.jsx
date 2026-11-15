export default function ChatAvatar({ user, online }) {
    return (
        <span className="relative size-10 shrink-0">
            <span className="grid size-full place-items-center overflow-hidden rounded-full bg-[#e7f0ec] text-sm font-semibold text-[#346557]" aria-hidden="true">
                {user.profilePicture ? <img src={user.profilePicture} alt="" className="size-full object-cover" /> : user.userName?.charAt(0).toUpperCase()}
            </span>
            <span aria-label={online ? "Online" : "Offline"} className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-white ${online ? "bg-[#23805b]" : "bg-[#a3b7ae]"}`} />
        </span>
    );
}
