"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "../../../../../../locales/client";
import Link from "next/link";
import { Users, LayoutDashboard, BarChart3, Settings } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import version from "../../../../../../package.json";




export const AdminSidebar = () => {
  const t = useI18n();
  const pathname = usePathname();

  const navigation = [
    {
      name: t("admin.sidebar.dashboard"),
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      description: t("admin.sidebar.dashboard_description"),
    },
    {
      name: t("admin.sidebar.users"),
      href: "/admin/users",
      icon: Users,
      description: t("admin.sidebar.users_description"),
    },
    {
      name: t("admin.sidebar.programs"),
      href: "/admin/programs",
      icon: BarChart3,
      description: t("admin.sidebar.programs_description"),
    },
    {
      name: t("admin.sidebar.settings"),
      href: "/admin/settings",
      icon: Settings,
      description: t("admin.sidebar.settings_description"),
    },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-1 flex-col pt-6">
        <nav className="flex-1 space-y-2 px-4">
          <div className="mb-6">
            <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("admin.sidebar.navigation")}</h2>
          </div>

          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                )}
                href={item.href}
                key={item.name}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300",
                  )}
                />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>{t("admin.sidebar.admin_footer")}</p>
            <p className="mt-1">{t("admin.sidebar.version")} {version.version}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
