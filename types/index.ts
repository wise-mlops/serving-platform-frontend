export {};

declare global {
  // htte response body
  interface ResponseBody {
    code: number;
    message?: string;
    result: any;
  }

  // dummy response body 
  interface DummyBody {
    products: any;
    total: number;
    skip: number;
    limit: number;
  }
}