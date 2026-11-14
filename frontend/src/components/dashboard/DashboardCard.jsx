// src/components/dashboard/DashboardCard.jsx
import { Link } from "react-router-dom";

const DashboardCard = ({ title, subtitle, gradient, to }) => {
    return (
        <Link to={to}
            className={`p-5 ${gradient} rounded-xl shadow-xl flex flex-col justify-center items-center text-center hover:scale-105 transform transition duration-300 cursor-pointer`}
        >
            <span className="font-semibold text-white flex items-center gap-2">{title}</span>
            <span className="text-white text-sm">{subtitle}</span>
        </Link>
    );
};

export default DashboardCard;
