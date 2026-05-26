declare module "../config/database" {
  export function getDbPool(): any;
  export function testConnection(): Promise<any>;
  export function query(sql: string, params?: any[]): Promise<any>;
  export function closePool(): Promise<void>;
}

declare module "../../config/database" {
  export function getDbPool(): any;
  export function testConnection(): Promise<any>;
  export function query(sql: string, params?: any[]): Promise<any>;
  export function closePool(): Promise<void>;
}

declare module "../../utils/api-response" {
  export function sendSuccess(res: any, message: string, data?: any, statusCode?: number): any;
}

declare module "../../utils/service-helpers" {
  export function createError(message: string, statusCode?: number): Error & { statusCode?: number };
  export function toPositiveInteger(value: any, fieldName?: string): number;
}
