import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/50",
        "after:absolute after:inset-0 after:bg-background/40 after:animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
