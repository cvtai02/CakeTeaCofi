import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BoxIcon,
  ChartColumnBigIcon,
  ClipboardListIcon,
  FileTextIcon,
  GiftIcon,
  SettingsIcon,
  UsersIcon,
  ChevronDownIcon,
  BellIcon,
  LogOutIcon,
  TagIcon,
  ShoppingCartIcon,
  DatabaseIcon,
  Building2Icon,
  ArrowLeftIcon,
} from "lucide-react";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotificationHub } from "@/hooks/use-notification-hub";
import { ROUTES } from "@/configs/routes";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIdentityStore } from "@/stores/identity";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../ui/mode-toggle";

type NavSubItem = { label: string; to: string };
type NavItem = {
  label: string;
  to: string;
  icon: ComponentType;
  subItems?: NavSubItem[];
  requireRole?: "SystemAdmin";
};

function buildTenantNavItems(sig: string): NavItem[] {
  const p = (path: string) => `/${sig}${path}`;
  return [
    { label: "Orders", to: p(ROUTES.orders), icon: ClipboardListIcon },
    {
      label: "Products",
      to: p(ROUTES.products),
      icon: BoxIcon,
      subItems: [
        { label: "All Products",    to: p(ROUTES.products) },
        { label: "Category",        to: p(ROUTES.productCategory) },
        { label: "Collections",     to: p(ROUTES.productCollections) },
        { label: "Inventory",       to: p(ROUTES.productInventory) },
      ],
    },
    {
      label: "Content",
      to: p(ROUTES.contentFiles),
      icon: FileTextIcon,
      subItems: [
        { label: "Files",            to: p(ROUTES.contentFiles) },
        { label: "Blogs",            to: p(ROUTES.contentBlogs) },
        { label: "Blog Collections", to: p(ROUTES.contentBlogCollections) },
        { label: "Galleries",        to: p(ROUTES.contentGalleries) },
      ],
    },
    { label: "Customers", to: p(ROUTES.customers), icon: UsersIcon },
    {
      label: "Marketing",
      to: `/${sig}/marketing`,
      icon: GiftIcon,
    },
    { label: "Promotion", to: `/${sig}/promotion`, icon: TagIcon },
    {
      label: "Analytics",
      to: `/${sig}/analytics`,
      icon: ChartColumnBigIcon,
    },
    { label: "Settings", to: `/${sig}/settings`, icon: SettingsIcon },
  ];
}

const systemNavItems: NavItem[] = [
  {
    label: "Manage Tenants",
    to: ROUTES.tenants,
    icon: Building2Icon,
    requireRole: "SystemAdmin",
  },
  { label: "System", to: ROUTES.system, icon: DatabaseIcon },
];

function NavItemRow({ item }: { item: NavItem }) {
  const location = useLocation();
  const { state: sidebarState, setOpen: setSidebarOpen } = useSidebar();
  const isActive = item.subItems
    ? item.subItems.some(
        (sub) =>
          location.pathname === sub.to ||
          location.pathname.startsWith(sub.to + "/")
      )
    : location.pathname === item.to ||
      location.pathname.startsWith(item.to + "/");

  const [prevIsActive, setPrevIsActive] = useState(isActive);
  const [open, setOpen] = useState(isActive);

  if (prevIsActive !== isActive) {
    setPrevIsActive(isActive);
    if (isActive) setOpen(true);
  }

  if (item.subItems) {
    return (
      <SidebarMenuItem>
        <Collapsible open={open} onOpenChange={setOpen}>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.label}
            onClick={() => {
              if (sidebarState === "collapsed") {
                setSidebarOpen(true);
              } else {
                setOpen((o) => !o);
              }
            }}
          >
            <item.icon />
            <span>{item.label}</span>
            <ChevronDownIcon
              className={cn(
                "ml-auto size-4 shrink-0 transition-transform",
                open && "rotate-180"
              )}
            />
          </SidebarMenuButton>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((sub) => (
                <SidebarMenuSubItem key={sub.to}>
                  <SidebarMenuSubButton
                    isActive={location.pathname === sub.to}
                    render={<NavLink to={sub.to} />}
                  >
                    {sub.label}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        render={<NavLink to={item.to} />}
      >
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { tenantSignature } = useParams<{ tenantSignature?: string }>();
  const { logout, email, role } = useIdentityStore();
  const { notifications, unreadCount, markAllRead, markOneRead, clearAll } = useNotificationHub();
  const queryClient = useQueryClient();
  const prevTenantRef = useRef<string | undefined>(undefined);

  // Clear the entire query cache whenever the active tenant changes so stale
  // data from the previous tenant is never shown on the new tenant's pages.
  useEffect(() => {
    if (prevTenantRef.current !== undefined && prevTenantRef.current !== tenantSignature) {
      queryClient.clear();
    }
    prevTenantRef.current = tenantSignature;
  }, [tenantSignature, queryClient]);

  const isTenantContext = Boolean(tenantSignature);
  const navItems = isTenantContext
    ? buildTenantNavItems(tenantSignature!)
    : systemNavItems.filter((item) => !item.requireRole || item.requireRole === role);

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.signin);
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : "MS";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        {/* Header */}
        <SidebarHeader className="border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              {isTenantContext ? (
                <SidebarMenuButton size="lg" tooltip={tenantSignature}>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    {tenantSignature![0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm leading-tight capitalize">
                      {tenantSignature}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {email || "admin@store.com"}
                    </span>
                  </div>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton size="lg" tooltip="System Admin">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    S
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm leading-tight">System Admin</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {email || "admin@store.com"}
                    </span>
                  </div>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Nav items */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {isTenantContext && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Back to tenants"
                      render={<NavLink to="/" />}
                    >
                      <ArrowLeftIcon />
                      <span>Back to tenants</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {navItems.map((item) => (
                  <NavItemRow key={item.to} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
                <LogOutIcon />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <ModeToggle />
            <DropdownMenu onOpenChange={(open) => { if (open) markAllRead(); }}>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8 relative">
                    <BellIcon className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <span className="text-sm font-semibold">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <BellIcon className="size-6 text-muted-foreground/40" />
                      <p className="text-xs text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer border-b last:border-0 transition-colors ${n.isRead ? "hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"}`}
                        onClick={() => {
                          markOneRead(n.id);
                          if ((n.entityType === "Order" || n.type === "OrderPlaced") && n.entityId) {
                            const path = ROUTES.orderDetail(n.entityId);
                            navigate(tenantSignature ? `/${tenantSignature}${path}` : path);
                          }
                        }}
                      >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <ShoppingCartIcon className="size-3.5 text-primary" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs font-medium leading-tight">{n.title}</span>
                          {n.message && (
                            <span className="text-[11px] text-muted-foreground truncate">{n.message}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(n.created).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        {!n.isRead && (
                          <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">New</Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar className="size-7 cursor-pointer">
              <AvatarFallback className="bg-emerald-500 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
