import { getSettings } from '@/app/actions/settings';
import { getDefaultTenant } from '@/app/actions/tenant';
import SettingsForm from '@/components/SettingsForm';
import TenantSettingsForm from '@/components/TenantSettingsForm';
import { Settings as SettingsIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    const settings = await getSettings();
    const tenant = await getDefaultTenant();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-10 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <SettingsIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                    <p className="text-gray-500 text-sm">Gerencie sua loja e integrações.</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Tenant Settings - Personalization */}
                {tenant && <TenantSettingsForm tenant={tenant} />}

                {/* Integration Settings */}
                <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Integrações</h2>
                    <SettingsForm initialSettings={settings} />
                </div>
            </div>
        </div>
    );
}
