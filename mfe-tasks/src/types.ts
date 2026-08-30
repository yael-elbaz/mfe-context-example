export type TaskStatus = 'unit-read' | 'open' | 'returned' | 'managed';

/** שורת מטלה — העמודות לפי טבלת "מטלות" בעיצוב */
export interface Task {
  id: string;
  /** שלב המטלה */
  stage: string;
  /** שם המטלה */
  name: string;
  /** נושא */
  subject: string;
  /** בעינינו של */
  owner: string;
  /** תאריך */
  date: string;
  /** שעה */
  time: string;
  status: TaskStatus;
}
