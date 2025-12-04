import {React} from "react";
import { FileText } from "lucide-react";

const DashboardCard = ({
  title,
  value,
  subtitle,
  color,
}) => {
  return (
    <div
      className={`p-6 rounded-2xl shadow-lg flex h-72`}
      style={{ backgroundColor: color ? color : "#4338ca" }}
    >
      <div className="flex-1 flex flex-col justify-center gap-2">
        <p className="text-3xl text-white font-semibold">{title}</p>
        <h2 className="text-7xl text-white font-bold">{value}</h2>
        {subtitle && (
          <p className="text-2xl text-white font-light">{subtitle}</p>
        )}
      </div>
      <div className="flex items-start ml-4">
        <FileText size={48} className="text-white" />
      </div>
    </div>
  );
};

export default DashboardCard;


