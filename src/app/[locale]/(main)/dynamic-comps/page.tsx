import ClientGuardFilters from '@/components/features/ClientGuardFilters';
import { ClientOnly } from '@/components/features/ClientOnly';
import {
  isWidgetType,
  loadDynamicComponent,
  loadWidget,
  widgetRegistry,
} from '@/components/widgets';
import type { ComponentInfo } from '@/types';

async function fetchComps(): Promise<ComponentInfo[]> {
  return [
    { id: 1, type: 'banner', login_type: 1 },
    { id: 2, type: 'card', login_type: 1 },
    { id: 3, type: 'nested', login_type: 1 },
    { id: 4, type: 'footer', login_type: 1 },
    { id: 5, type: 'divider', login_type: 1 },
    { id: 6, type: 'nested', login_type: 1 },
  ];
}

export default async function DynamicCompsPage() {
  const comps = await fetchComps();

  const renderData = await Promise.all(
    comps.map(async (component, index) => {
      try {
        if (!isWidgetType(component.type)) {
          console.warn(`⚠️ Unknown component type: ${component.type}`);
          return null;
        }
        const cfg = await loadWidget(component.type);
        const result = await cfg.getData({ component });

        return {
          key: component.id ?? `${component.type}-${index}`,
          type: component.type,
          data: result.data,
        };
      } catch (error) {
        console.error(`Error loading component ${component.type}:`, error);
        return null;
      }
    }),
  );

  console.log(renderData);
  return renderData.map((item) => {
    if (!item) return null;

    const entry = widgetRegistry[item.type];

    const ClientComp = loadDynamicComponent(entry.client, 'client');
    const SuspenseComp = loadDynamicComponent(entry.suspense, 'suspense');

    return (
      <ClientOnly key={item.key} fallback={<SuspenseComp {...item.data} />}>
        <ClientGuardFilters component={item.data.component}>
          <ClientComp {...item.data} />
        </ClientGuardFilters>
      </ClientOnly>
    );
  });
}
