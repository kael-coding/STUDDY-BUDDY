const roles = { user: "Student", admin: "Community Admin" };

export default function AccountsTable({ users, onDelete }) {
    if (!users.length) return <p className="rounded-xl border border-[#dce7e1] bg-white p-6 text-sm text-[#526c62]">No matching accounts.</p>;

    return (
        <div className="overflow-x-auto rounded-xl border border-[#dce7e1] bg-white">
            <table aria-label="Manageable accounts" className="w-full min-w-[37rem] text-left text-sm">
                <thead className="bg-[#f0f6f3] text-xs text-[#425d52]">
                    <tr>{["Name", "Email", "Role", "Account information", "Actions"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#edf2ef]">
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="p-3">
                                <div className="flex items-center gap-2 font-medium [overflow-wrap:anywhere]">
                                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e7f0ec] text-xs text-[#346557]">{user.userName?.charAt(0).toUpperCase()}</span>
                                    {user.userName}
                                </div>
                            </td>
                            <td className="p-3 text-[#526c62] [overflow-wrap:anywhere]">{user.email}</td>
                            <td className="p-3"><span className="inline-block rounded-md bg-[#e7f0ec] px-2 py-1 text-xs font-medium text-[#346557]">{roles[user.role] ?? user.role}</span></td>
                            <td className="p-3 text-xs text-[#526c62]">
                                <span className={user.isVerified ? "font-medium text-[#346557]" : "font-medium text-amber-800"}>{user.isVerified ? "Verified" : "Unverified"}</span>
                                <p className="mt-1">{user.taskCount} tasks · {user.noteCount} notes</p>
                            </td>
                            <td className="p-3"><button type="button" aria-label={`Delete account for ${user.userName}`} onClick={() => onDelete(user)}
                                className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete account</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
