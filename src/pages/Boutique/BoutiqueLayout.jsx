import { NavLink, Outlet } from "react-router-dom";
import { Store, ShoppingBag, ClipboardList, Star, Users, Bell } from "lucide-react";
import { useCart } from "../../context/CartContext";

const onglets = [
  { to: "/boutique", label: "Catalogue", icon: Store, end: true },
  { to: "/boutique/panier", label: "Panier", icon: ShoppingBag },
  { to: "/boutique/commande", label: "Commande", icon: ClipboardList },
  { to: "/boutique/avis", label: "Avis", icon: Star },
  { to: "/boutique/parrainage", label: "Parrainage", icon: Users },
  { to: "/boutique/nouveautes", label: "Nouveautés", icon: Bell },
];

export default function BoutiqueLayout() {
  const { cart } = useCart();
  const itemCount = Object.values(cart).reduce((s, q) => s + q, 0);

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {onglets.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? "bg-[#F5720C] text-white" : "text-gray-500"
                }`
              }
            >
              <Icon size={14} />
              {label}
              {label === "Panier" && itemCount > 0 && (
                <span className="ml-1 bg-white text-[#F5720C] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="p-3">
        <Outlet />
      </div>
    </div>
  );
}
