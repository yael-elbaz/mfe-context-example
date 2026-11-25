import { useState, useCallback } from 'react';

// Lives at module level, not in the component: the shell unmounts the MFE while it loads
// the next employee, so component state would reset. This keeps the row open across tab
// and employee switches until the user collapses it (resets only on page reload).
let lastExpanded = false;

/** The expanded row (fields that didn't fit) — once opened, stays open until the user closes it. */
export function useExpandedRow() {
  const [expanded, setExpanded] = useState(lastExpanded);

  const toggleExpanded = useCallback(() => {
    setExpanded(e => {
      lastExpanded = !e;
      return lastExpanded;
    });
  }, []);

  return { expanded, toggleExpanded };
}
