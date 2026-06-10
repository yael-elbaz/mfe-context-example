import { useState, useCallback } from 'react';
import type { MoreDataTab, TabConfig, TabData } from '../types';
import { SYNTHETIC_MORE_DATA_TAB_ID, fetchTabsConfig, fetchActiveTabData } from '../tabsConfig';

function resolveActiveTab(
  tabs: TabConfig[],
  selectedActiveTab?: number,
  moreDataSetAsActive?: boolean,
): TabConfig | null {
  if (!tabs.length) return null;

  if (moreDataSetAsActive) {
    const synthetic = tabs.find(t => t.id === SYNTHETIC_MORE_DATA_TAB_ID);
    if (synthetic) return synthetic;
  }

  if (selectedActiveTab != null) {
    const match = tabs.find(t => t.id === selectedActiveTab);
    if (match) return match;
  }

  return tabs.reduce((min, t) => t.order < min.order ? t : min, tabs[0]);
}

export function useTabs() {
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [tabsLoading, setTabsLoading] = useState(false);
  const [tabsError, setTabsError] = useState(false);

  const [activeTab, setActiveTab] = useState<TabConfig | null>(null);
  const [tabData, setTabData] = useState<TabData | null>(null);
  const [tabDataLoading, setTabDataLoading] = useState(false);
  const [tabDataError, setTabDataError] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const loadTabs = useCallback((
    employeeId: string,
    moreDataTab?: MoreDataTab | null,
    selectedActiveTab?: number,
  ) => {
    setTabsLoading(true);
    setTabsError(false);
    setTabs([]);
    setActiveTab(null);
    setTabData(null);
    setIsExpanded(false);

    let cancelled = false;

    fetchTabsConfig(employeeId)
      .then(normalizedTabs => {
        if (cancelled) return;

        if (moreDataTab) {
          const { label, dataUrl, color = '#888888', order } = moreDataTab;
          normalizedTabs.push({
            id: SYNTHETIC_MORE_DATA_TAB_ID,
            objectName: 'moreData',
            displayName: label,
            title: label,
            color,
            order: order ?? Infinity,
            dataUrl,
            iconUrl: '',
            isInternal: false,
          });
          normalizedTabs.sort((a, b) => a.order - b.order);
        }

        setTabs(normalizedTabs);
        setActiveTab(resolveActiveTab(normalizedTabs, selectedActiveTab, moreDataTab?.setAsActive));
        setIsExpanded(true);
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

  const loadTabData = useCallback((tab: TabConfig, employeeId: string) => {
    setTabDataLoading(true);
    setTabDataError(false);
    setTabData(null);

    let cancelled = false;

    fetchActiveTabData(tab.dataUrl, employeeId)
      .then(data => {
        if (!cancelled) {
          setTabData(data);
          setTabDataLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTabDataError(true);
          setTabDataLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  const handleTabClick = useCallback((tab: TabConfig) => {
    setActiveTab(tab);
    setIsExpanded(true);
  }, []);

  return {
    tabs,
    tabsLoading,
    tabsError,
    activeTab,
    tabData,
    tabDataLoading,
    tabDataError,
    isExpanded,
    loadTabs,
    loadTabData,
    handleTabClick,
  };
}
