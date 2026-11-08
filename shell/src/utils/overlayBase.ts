/**
 * תיקים שבתוכם אוברליי תמיד נפתח מעל מסך ה-preview של התיק (השורש שלו).
 * תיק חדש = שורה אחת כאן.
 */
export const PORTFOLIO_ROOTS = ['/employee-portfolio', '/customer-portfolio'];

/** הדף שהאוברליי נפתח מעליו: בתוך תיק — שורש התיק; בכל מקום אחר — הדף הנוכחי */
export function overlayBasePath(pathname: string): string {
  return PORTFOLIO_ROOTS.find(root => pathname === root || pathname.startsWith(root + '/')) ?? pathname;
}
