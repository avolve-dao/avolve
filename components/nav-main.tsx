import { ChevronDown, ChevronRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  title: string;
  url: string;
  icon?: React.ElementType;
  items?: NavItem[];
  category?: string;
  gradientClass?: string;
  isDashboard?: boolean;
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();
  const dashboardItems = items.filter(item => item.isDashboard);
  const regularItems = items.filter(item => !item.isDashboard);

  return (
    <div className="flex flex-col gap-1 px-2">
      {/* Dashboard Section */}
      {dashboardItems.length > 0 && (
        <div className="mb-4">
          {dashboardItems.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.url
                  ? "bg-gradient-to-r text-primary-foreground " + (item.gradientClass || "from-primary to-primary")
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon ? (
                <item.icon className="h-4 w-4" />
              ) : (
                <LayoutDashboard className="h-4 w-4" />
              )}
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Regular Items Section */}
      <div className="space-y-1">
        {regularItems.map((item) => (
          <NavItemWithSub key={item.id} item={item} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}

function NavItemWithSub({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(
    pathname.startsWith(item.url) || item.items?.some((subItem) => pathname === subItem.url)
  );

  const isActive = pathname === item.url || item.items?.some((subItem) => pathname === subItem.url);

  return (
    <div>
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-gradient-to-r text-primary-foreground " + (item.gradientClass || "from-primary to-primary")
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => item.items && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.url ? (
            <Link href={item.url}>
              <span>{item.title}</span>
            </Link>
          ) : (
            <span>{item.title}</span>
          )}
        </div>
        {item.items && (
          <div className="text-muted-foreground">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        )}
      </div>
      {isOpen && item.items && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-3">
          {item.items.map((subItem) => (
            <Link
              key={subItem.id}
              href={subItem.url}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === subItem.url
                  ? "bg-gradient-to-r text-primary-foreground " + (subItem.gradientClass || "from-primary/80 to-primary")
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {subItem.icon && <subItem.icon className="h-4 w-4" />}
              <span>{subItem.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
