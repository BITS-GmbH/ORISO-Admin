import { useEffect, useRef, useState } from 'react';
import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { addonServiceURL } from '../appConfig';
import type { AddonApp, AddonHostProps, AddonModule, AvailableAddon } from './addonTypes';
import { loadAddonModule } from './loadAddonModule';
import { type AddonTenant, useAddonHostProps } from './useAddonHostProps';

const bootstrapped = new WeakSet<AddonModule>();

interface AddonMountProps {
    addon: AvailableAddon;
    app: AddonApp;
    tenant: AddonTenant;
    /** Injected in tests; defaults to the dynamic import of the bundle. */
    loader?: (url: string) => Promise<AddonModule>;
    baseUrl?: string;
}

/** Loads an add-on bundle and mounts one of its apps as an admin page. */
export const AddonMount = ({
    addon,
    app,
    tenant,
    loader = loadAddonModule,
    baseUrl = addonServiceURL,
}: AddonMountProps) => {
    const { t } = useTranslation();
    const element = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);
    const hostProps = useAddonHostProps(addon, app, tenant);

    useEffect(() => {
        const domElement = element.current;
        if (!domElement) {
            return undefined;
        }
        let active = true;
        let mounted: { module: AddonModule; props: AddonHostProps } | null = null;
        setFailed(false);

        (async () => {
            try {
                const module = await loader(`${baseUrl}${addon.entry}`);
                const props: AddonHostProps = { ...hostProps, domElement };
                if (!bootstrapped.has(module)) {
                    await module.bootstrap?.(props);
                    bootstrapped.add(module);
                }
                if (!active) {
                    return;
                }
                await module.mount(props);
                mounted = { module, props };
                if (!active) {
                    await module.unmount(props);
                    mounted = null;
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Add-on ${addon.name}/${app.id} failed`, error);
                if (active) {
                    setFailed(true);
                }
            }
        })();

        return () => {
            active = false;
            if (mounted) {
                const { module, props } = mounted;
                Promise.resolve(module.unmount(props)).catch((error) =>
                    // eslint-disable-next-line no-console
                    console.error(`Add-on ${addon.name}/${app.id} failed to unmount`, error),
                );
            }
        };
    }, [addon, app.id, hostProps, loader, baseUrl]);

    return (
        <div className="addonMount" data-addon={addon.name} data-addon-app={app.id} data-addon-slot="admin.page">
            {failed && <Alert type="error" showIcon role="alert" message={t('addons.page.loadError')} />}
            <div ref={element} />
        </div>
    );
};

export default AddonMount;
