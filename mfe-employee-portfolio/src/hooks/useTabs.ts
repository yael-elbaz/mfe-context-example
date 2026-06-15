import { useState, useCallback } from 'react';
import type { TabConfig, TabData } from '../types';
import { SYNTHETIC_MORE_DATA_TAB_ID, buildMoreDataTab, fetchTabsConfig, fetchTabData } from '../tabsConfig';

function resolveActiveTab(
  tabs: TabConfig[],
  selectedActiveTab?: number,
  hasExtendedDataTab?: boolean,
): TabConfig | null {
  if (!tabs.length) return null;

  // The "more data" tab, when present, is always the active tab.
  if (hasExtendedDataTab) {
    const synthetic = tabs.find(t => t.id === SYNTHETIC_MORE_DATA_TAB_ID);
    if (synthetic) return synthetic;
  }

  if (selectedActiveTab != null) {
    const match = tabs.find(t => t.id === selectedActiveTab);
    if (match) return match;
  }

  return tabs.reduce((min, t) => t.order < min.order ? t : min, tabs[0]);
}

// A tab is "empty" when every data section came back without entries.
// Iterates all sections dynamically so new sections are covered automatically.
function isTabDataEmpty(d: TabData): boolean {
  return Object.values(d).every(
    section => !section || Object.keys(section).length === 0,
  );
}

export function useTabs() {
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [tabsLoading, setTabsLoading] = useState(false);
  const [tabsError, setTabsError] = useState(false);

  // The active tab drives the collapsed main row (its basicData is shown there).
  const [activeTab, setActiveTab] = useState<TabConfig | null>(null);
  // All tab data is prefetched up front and kept here, keyed by tab id.
  const [tabDataById, setTabDataById] = useState<Record<number, TabData>>({});

  // Accordion: whether the panel is open, and which single card is expanded.
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTabId, setOpenTabId] = useState<number | null>(null);

  const loadTabs = useCallback((
    employeeId: string,
    extendedTabDataUrl?: string | null,
    selectedActiveTab?: number,
  ) => {
    setTabsLoading(true);
    setTabsError(false);
    setTabs([]);
    setActiveTab(null);
    setTabDataById({});
    setIsExpanded(false);
    setOpenTabId(null);

    let cancelled = false;

    fetchTabsConfig(employeeId)
      .then(async normalizedTabs => {
        if (cancelled) return;

        if (extendedTabDataUrl) {
          normalizedTabs.push(buildMoreDataTab(extendedTabDataUrl));
        }
        // Always order by `order` ASC — covers both the API tabs and any injected tab.
        normalizedTabs.sort((a, b) => a.order - b.order);

        // Fetch every tab's data in parallel so the accordion is instant later.
        const results = await Promise.allSettled(
          normalizedTabs.map(t => fetchTabData(t.dataUrl, employeeId)),
        );
        if (cancelled) return;

        // Keep only tabs whose data resolved and is non-empty.
        const visibleTabs: TabConfig[] = [];
        const dataById: Record<number, TabData> = {};
        results.forEach((res, i) => {
          if (res.status === 'fulfilled' && !isTabDataEmpty(res.value)) {
            visibleTabs.push(normalizedTabs[i]);
            dataById[normalizedTabs[i].id] = res.value;
          }
        });

        const active = resolveActiveTab(visibleTabs, selectedActiveTab, !!extendedTabDataUrl);
        setTabs(visibleTabs);
        setTabDataById(dataById);
        setActiveTab(active);
        setOpenTabId(active?.id ?? null); // active card is the one open by default
        setTabsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setTabsError(true);
          setTabsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Expand icon at the end of the main row: show/hide the accordion. When opening,
  // default the active tab's card to open.
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev;
      if (next) setOpenTabId(curr => curr ?? activeTab?.id ?? null);
      return next;
    });
  }, [activeTab]);

  // Accordion card header click: open it, or collapse it if it's already open.
  const toggleCard = useCallback((tab: TabConfig) => {
    setOpenTabId(curr => (curr === tab.id ? null : tab.id));
  }, []);

  const activeTabData = activeTab ? tabDataById[activeTab.id] ?? null : null;

  return {
    tabs,
    tabsLoading,
    tabsError,
    activeTab,
    activeTabData,
    tabDataById,
    isExpanded,
    openTabId,
    loadTabs,
    toggleExpanded,
    toggleCard,
  };
}
