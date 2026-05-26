export function getDbPool(): any;
export function testConnection(): Promise<any>;
export function query(sql: string, params?: any[]): Promise<any>;
export function closePool(): Promise<void>;
