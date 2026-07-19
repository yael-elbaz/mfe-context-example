import React from 'react';

interface Props {
  children: React.ReactNode;
  /** האם לתפוס גם דחיות Promise גלובליות שלא טופלו (fetch בלי catch). ברירת מחדל: true */
  catchUnhandledRejections?: boolean;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * גבול שגיאות ל-mfe-sherutim.
 *
 * תופס שני סוגי כשלים ומציג הודעה ידידותית במקום שהאפליקציה "תישבר":
 *  (1) שגיאות שנזרקות בזמן render / lifecycle בתוך העץ — דרך getDerivedStateFromError.
 *  (2) דחיות Promise שלא טופלו (async fetch ללא catch) — דרך מאזין גלובלי
 *      ל-'unhandledrejection'. חשוב: Error Boundary לבדו *לא* תופס דחיות כאלה,
 *      ולכן צריך את המאזין הזה בנוסף.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // כאן אפשר לשלוח דיווח ל-monitoring (Sentry וכו')
    console.error('[mfe-sherutim] render error:', error, info);
  }

  componentDidMount() {
    if (this.props.catchUnhandledRejections !== false) {
      window.addEventListener('unhandledrejection', this.handleRejection);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleRejection);
  }

  private handleRejection = (event: PromiseRejectionEvent) => {
    console.error('[mfe-sherutim] unhandled promise rejection:', event.reason);
    event.preventDefault(); // מונע את שגיאת הקונסול הדיפולטית
    const reason = event.reason;
    this.setState({
      hasError: true,
      message: reason instanceof Error ? reason.message : String(reason),
    });
  };

  private handleRetry = () => {
    // מאפס את הגבול; אם הנתונים לא נטענו בכלל, טעינה מחדש של העמוד אמינה יותר
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div dir="rtl" className="flex flex-col items-center justify-center text-center gap-3 p-10">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FDECEC] text-[#D64545] text-2xl">
          ⚠️
        </div>
        <h3 className="m-0 text-[#1A1E27] text-[18px] font-semibold">
          משהו השתבש בטעינת השירותים
        </h3>
        <p className="m-0 text-[#4A5568] text-[14px] max-w-[360px]">
          לא הצלחנו לטעון חלק מהמידע. אפשר לנסות שוב — שאר המערכת ממשיכה לעבוד כרגיל.
        </p>
        {this.state.message && (
          <p className="m-0 text-[#A0AEC0] text-[12px] max-w-[360px] break-words">
            ({this.state.message})
          </p>
        )}
        <button
          onClick={this.handleRetry}
          className="mt-2 h-[41px] px-6 rounded-full bg-[#2B7FFF] text-white text-[14px] hover:bg-[#1E6BE0] transition-colors"
        >
          נסה שוב
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
