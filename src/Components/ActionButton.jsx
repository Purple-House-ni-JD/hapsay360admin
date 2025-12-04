import React from "react";

const baseClasses =
  "inline-flex items-center gap-1.5 rounded-full border font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

const sizeClasses = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
};

const variantClasses = {
  info: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 focus:ring-blue-200",
  accent:
    "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 focus:ring-purple-200",
  danger:
    "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 focus:ring-rose-200",
  warning:
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 focus:ring-amber-200",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 focus:ring-emerald-200",
  neutral:
    "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 focus:ring-gray-200",
  link: "bg-transparent text-indigo-600 border-transparent hover:bg-indigo-50 focus:ring-indigo-200",
};

const ActionButton = ({
  label,
  icon: Icon,
  variant = "neutral",
  size = "sm",
  className = "",
  type = "button",
  ...props
}) => {
  const variantClass = variantClasses[variant] || variantClasses.neutral;
  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;

