export { };

declare global {
  // http response body
  interface ResponseBody {
    code: number;
    message?: string;
    result: any;
  }

  type status = 'True' | 'False' | 'Unknown';
}