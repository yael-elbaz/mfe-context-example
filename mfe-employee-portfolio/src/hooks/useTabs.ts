import { useState, useCallback, useEffect, useMemo } from 'react';
import type { TabConfig, TabData } from '../types';
import { useSelectedUnit } from 'shell/store';
import { SYNTHETIC_MORE_DATA_TAB_ID, buildMoreDataTab, fetchTabsConfig, fetchTabData } from '../tabsConfig';

function resolveActiveTab(
  tabs: TabConfig[],
  selectedActiveTab?: number,
  unitId?: string,
): TabConfig | null {
  if (!tabs.length) return null;

  // The "more data" tab, when present, is always the active tab. It only exists when
  // an extendedTabDataUrl was provided, so its mere presence is the signal.
  const synthetic = tabs.find(t => t.id === SYNTHETIC_MORE_DATA_TAB_ID);
  if (synthetic) return synthetic;

  // Unit 4 always lands on the first tab (tabs are sorted by order ASC), overriding
  // any selectedActiveTab.
  if (unitId === '4') return tabs[0];

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

export function useTabs(selectedActiveTab?: number) {
  // The logged-in user's selected work unit drives the active-tab rule above.
  const selectedUnit = useSelectedUnit();

  // Base tabs come from the permanent config + their per-employee data.
  const [baseTabs, setBaseTabs] = useState<TabConfig[]>([]);
  const [baseDataById, setBaseDataById] = useState<Record<number, TabData>>({});
  const [tabsLoading, setTabsLoading] = useState(false);
  const [tabsError, setTabsError] = useState(false);

  // The injected "more data" tab + its data, kept separate so it can be loaded on its
  // own (when extendedTabDataUrl arrives/changes) without reloading the base tabs.
  const [moreDataTab, setMoreDataTab] = useState<TabConfig | null>(null);
  const [moreData, setMoreData] = useState<TabData | null>(null);

  // Accordion: whether the panel is open, and which single card is expanded.
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTabId, setOpenTabId] = useState<number | null>(null);

  // Loads the base tabs + their data. The caller decides when to run this (drive it
  // from an effect keyed on the employee). Returns a cleanup that cancels the in-flight
  // load, so it can be returned straight from a useEffect.
  const loadBaseTabs = useCallback((employeeId: string) => {
    let cancelled = false;
    setTabsLoading(true);
    setTabsError(false);
    setBaseTabs([]);
    setBaseDataById({});
    setIsExpanded(false);

    fetchTabsConfig()
      .then(async normalizedTabs => {
        if (cancelled) return;
        // Always order by `order` ASC.
        normalizedTabs.sort((a, b) => a.order - b.order);

        // Fetch every base tab's data in parallel so the accordion is instant later.
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

        setBaseTabs(visibleTabs);
        setBaseDataById(dataById);
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

  // Loads (or clears) the injected "more data" tab. Drive it from an effect keyed on
  // the employee + extendedTabDataUrl — it never touches the base tabs.
  const loadMoreDataTab = useCallback((
    employeeId?: string,
    extendedTabDataUrl?: string | null,
  ) => {
    if (!employeeId || !extendedTabDataUrl) {
      setMoreDataTab(null);
      setMoreData(null);
      return undefined;
    }

    let cancelled = false;
    const tab = buildMoreDataTab(extendedTabDataUrl);

    fetchTabData(tab.dataUrl, employeeId)
      .then(data => {
        if (cancelled) return;
        // Mirror the base-tab rule: only show it when it actually has data.
        if (isTabDataEmpty(data)) {
          setMoreDataTab(null);
          setMoreData(null);
          return;
        }
        setMoreDataTab(tab);
        setMoreData(data);
      })
      .catch(() => {
        if (!cancelled) {
          setMoreDataTab(null);
          setMoreData(null);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Displayed tab set = base tabs plus the "more data" tab (kept order-sorted).
  const tabs = useMemo(() => {
    if (!moreDataTab) return baseTabs;
    return [...baseTabs, moreDataTab].sort((a, b) => a.order - b.order);
  }, [baseTabs, moreDataTab]);

  const tabDataById = useMemo(() => {
    if (!moreDataTab || !moreData) return baseDataById;
    return { ...baseDataById, [moreDataTab.id]: moreData };
  }, [baseDataById, moreDataTab, moreData]);

  // The active tab is a pure selection over the loaded tabs, so changing
  // selectedActiveTab (or the unit) re-derives it without re-fetching anything.
  const activeTab = useMemo(
    () => resolveActiveTab(tabs, selectedActiveTab, selectedUnit?.id),
    [tabs, selectedActiveTab, selectedUnit?.id],
  );

  // The active tab's card is the one open by default. Re-syncs whenever the active
  // tab changes — new data loaded, a late "more data" tab, or a new selectedActiveTab.
  useEffect(() => {
    setOpenTabId(activeTab?.id ?? null);
  }, [activeTab]);

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
    loadBaseTabs,
    loadMoreDataTab,
    toggleExpanded,
    toggleCard,
  };
}
