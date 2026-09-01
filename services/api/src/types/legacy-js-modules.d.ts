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

declare module "*/warranty-sync.service" {
  export function createWarrantyRecordsForDeliveredOrder(orderId: number | string): Promise<any[]>;
}

declare module "*/order-events" {
  export function publishOrderEvent(userId: number | string, payload: any): void;
  export function subscribeOrderEvents(userId: number | string, res: any): () => void;
}

declare module "*/products.service" {
  export function invalidateProductSchemaCache(): void;
}
