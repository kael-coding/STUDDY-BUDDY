const DashboardCard = ({ title, subtitle, bgColor }) => {
    return (
        <div className={`p-5 ${bgColor} rounded shadow flex flex-col justify-center items-center text-center hover:opacity-75 cursor-pointer`}>
            <span className="font-semibold flex items-center gap-2">{title}</span>
            <span className="text-gray-500 text-sm">{subtitle}</span>
        </div>
    );
};

export default DashboardCard;
