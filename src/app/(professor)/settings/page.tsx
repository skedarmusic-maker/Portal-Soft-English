import SettingsForm from '@/components/settings/SettingsForm';
import { getSettings } from '@/app/actions/settings-actions';

export default async function SettingsPage() {
  const initialData = await getSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as preferências do seu portal.</p>
      </div>

      <div className="w-full">
         <SettingsForm initialData={initialData} />
      </div>
    </div>
  );
}

