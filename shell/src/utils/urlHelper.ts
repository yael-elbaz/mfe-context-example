type QueryParams = Record<string, string>;

export class Helper {
  // parses a query string ("?a=1&b=2" or "a=1&b=2") into a plain object
  static getQueryParamsAsObject(queryString?: string): QueryParams {
    if (!queryString) return {};
    return Object.fromEntries(
      queryString
        .slice(queryString.indexOf('?') + 1) // strip leading '?' if present
        .split('&')
        .map(param => param.split('='))       // split each "key=value" pair
    ) as QueryParams;
  }

  // serialises a plain object back to "key=value&key=value"
  static getObjQueryParams(obj: QueryParams): string {
    return Object.keys(obj)
      .map(key => `${key}=${obj[key]}`)
      .join('&');
  }

  // reads the current page's q param (still Base64-encoded)
  static getQueryParams(): string | null {
    return new URLSearchParams(window.location.search).get('q');
  }

  // decodes a Base64+URI-encoded q value back to a plain query string
  static decodeQueryString(val: string): string {
    return decodeURIComponent(window.atob(val)); // atob → Base64 decode, then URI-decode
  }

  // encodes a plain-object params map to a Base64+URI-encoded string
  static encodeQueryString(params: QueryParams): string {
    return window.btoa(encodeURIComponent(Helper.getObjQueryParams(params))); // URI-encode then Base64
  }

  // builds the full q=<encoded> query param:
  // reads existing params from q in the current URL, merges extra on top, re-encodes
  static buildQParam(extra?: string): string {
    const currentQ = Helper.getQueryParams();                                           // get raw Base64 q from current URL
    const current  = currentQ ? Helper.getQueryParamsAsObject(Helper.decodeQueryString(currentQ)) : {}; // decode → parse
    const extras   = extra ? Helper.getQueryParamsAsObject(extra) : {};                // parse sherutimUrlParams

    const merged = { ...current, ...extras };                                          // extra keys win on conflict
    if (Object.keys(merged).length === 0) return '';

    return `q=${Helper.encodeQueryString(merged)}`;                                    // re-encode and wrap in q=
  }

  // appends query string to path, only if non-empty
  static buildUrl(path: string, queryString: string): string {
    return queryString ? `${path}?${queryString}` : path;
  }

  // reads a param by key — first from plain query params, then from the decoded q param
  static getParam(key: string, searchParams: URLSearchParams): string | null {
    const plain = searchParams.get(key);
    if (plain) return plain;
    const q = searchParams.get('q');
    if (!q) return null;
    return Helper.getQueryParamsAsObject(Helper.decodeQueryString(q))[key] ?? null;
  }
}
