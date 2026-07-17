import { Switch } from "@/components/ui/switch";

interface NotificationSetting {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

interface NotificationPreferencesProps {
  settings: NotificationSetting[];
  onToggle: (id: string, enabled: boolean) => void;
}

export function NotificationPreferences({ settings, onToggle }: NotificationPreferencesProps) {
  return (
    <div className="flex flex-col gap-4">
      {settings.map((s) => (
        <div key={s.id} className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{s.label}</span>
            {s.description && <span className="text-xs text-muted-foreground">{s.description}</span>}
          </div>
          <Switch checked={s.enabled} onCheckedChange={(checked) => onToggle(s.id, checked)} />
        </div>
      ))}
    </div>
  );
}