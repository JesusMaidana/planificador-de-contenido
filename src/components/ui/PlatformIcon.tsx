import { Platform } from "@/types";
import { Youtube, Mic, Mail, Smartphone, Instagram } from "lucide-react";

interface PlatformIconProps {
    platform: Platform;
    className?: string;
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
    switch (platform) {
        case "YouTube":
            return <Youtube className={className} color="#FF0000" />;
        case "Short":
            return <Smartphone className={className} color="#FF0000" />;
        case "Reel":
            return <Instagram className={className} color="#E1306C" />;
        case "Podcast":
            return <Mic className={className} color="#A855F7" />;
        case "Email":
            return <Mail className={className} color="#3B82F6" />;
        default:
            return null;
    }
}
