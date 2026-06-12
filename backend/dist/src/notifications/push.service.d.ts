export declare class PushService {
    private subscriptions;
    subscribe(sub: any): {
        ok: boolean;
    };
    sendToAll(title: string, body: string, data?: any): Promise<void>;
    sendNotification(sub: any, title: string, body: string): Promise<void>;
}
