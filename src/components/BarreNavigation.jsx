import { NavLink } from "react-router-dom";
import { Home, Store, Building2, Search } from "lucide-react";

const onglets = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/boutique", label: "Boutique", icon: Store },
  { to: "/location", label: "Location", icon: Building2 },
  { to: "/requete", label: "Requête", icon: Search },
];

export default function BarreNavigation() {
  return (
    <div className="sticky bottom-0 z-30 bg-white border-t border-gray-100 flex px-1 pt-2 pb-3">
      {onglets.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 text-[10px] font-semibold relative ${
              isActive ? "text-[#F5720C]" : "text-gray-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -top-2 w-7 h-[3px] rounded-b-full bg-[#F5720C]" />
              )}
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  isActive ? "bg-[#FFF1E4]" : ""
                }`}
              >
                <Icon size={22} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
