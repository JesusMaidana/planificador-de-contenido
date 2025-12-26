import { Status } from "@/types";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

const statusStyles: Record<Status, string> = {
    Idea: "bg-zinc-800 text-zinc-300 border-zinc-700",
    Scripting: "bg-blue-950/50 text-blue-300 border-blue-900",
    Recording: "bg-red-950/50 text-red-300 border-red-900",
    Editing: "bg-amber-950/50 text-amber-300 border-amber-900",
    Scheduled: "bg-purple-950/50 text-purple-300 border-purple-900",
    Published: "bg-emerald-950/50 text-emerald-300 border-emerald-900",
};

interface StatusBadgeProps {
    status: Status;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                statusStyles[status],
                className
            )}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );
}
