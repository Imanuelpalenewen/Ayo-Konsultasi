import { useState, createContext, useContext } from "react";
import { cn } from "../../lib/utils";

interface TabsCtx { value: string; onChange: (v: string) => void }
const TabsContext = createContext<TabsCtx>({ value: "", onChange: () => {} });

export function Tabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.onChange(value)}
      className={cn(
        "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all",
        active
          ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn("", className)}>{children}</div>;
}
