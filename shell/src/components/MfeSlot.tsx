import React, { Suspense, Component, ReactNode } from 'react';

/** גבול שגיאה סביב טעינת MFE — מציג הודעה במקום להפיל את הדף */
export class MFEErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', color: '#c00', background: '#fff0f0', borderRadius: '8px' }}>
          <strong>שגיאה בטעינת מודול</strong>
          <pre style={{ fontSize: '12px', marginTop: '8px' }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

/** עוטף MFE ב-Suspense + ErrorBoundary */
export const mfe = (
  fallback: string,
  Comp: React.LazyExoticComponent<React.ComponentType<any>>,
  props?: Record<string, any>
) => (
  <MFEErrorBoundary>
    <Suspense fallback={<div>{fallback}</div>}>
      <Comp {...props} />
    </Suspense>
  </MFEErrorBoundary>
);
