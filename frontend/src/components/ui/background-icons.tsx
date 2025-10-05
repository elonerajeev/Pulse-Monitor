import {
  BarChart3,
  Globe,
  Monitor,
  Zap,
  Shield,
  Bell,
  Activity,
} from "lucide-react";

const BackgroundIcons = () => {
  const icons = [
    { icon: BarChart3, className: "top-1/4 left-1/4 w-12 h-12 text-blue-500" },
    { icon: Globe, className: "top-1/2 left-3/4 w-16 h-16 text-green-500" },
    { icon: Monitor, className: "top-3/4 left-1/4 w-14 h-14 text-purple-500" },
    { icon: Zap, className: "top-1/3 left-2/3 w-12 h-12 text-yellow-500" },
    { icon: Shield, className: "top-2/3 left-1/3 w-16 h-16 text-red-500" },
    { icon: Bell, className: "top-1/4 left-3/4 w-14 h-14 text-indigo-500" },
    { icon: Activity, className: "top-1/2 left-1/4 w-12 h-12 text-pink-500" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {icons.map((icon, index) => {
        const Icon = icon.icon;
        return (
          <Icon
            key={index}
            className={`absolute animate-float ${icon.className}`}
          />
        );
      })}
    </div>
  );
};

export default BackgroundIcons;
