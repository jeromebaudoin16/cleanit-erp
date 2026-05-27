import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@cleanit.cm',
  process.env.VAPID_PUBLIC_KEY || 'BNSQIjGGELW6UAg0K1bkGLRgkWf0xSn9pocHSAwrtMauehwBVm-v1fM3TE_QRoQVlBmq15FGbqMP3ZNmH7ZSjZc',
  process.env.VAPID_PRIVATE_KEY || 'R7FtPVAiJzlXqDKECMAToh1CwCGWY0YnAHzdQOKx8Xs'
);

@Injectable()
export class PushService {
  private subscriptions: any[] = [];

  subscribe(sub: any) {
    this.subscriptions.push(sub);
    return { ok: true };
  }

  async sendToAll(title: string, body: string, data?: any) {
    const payload = JSON.stringify({ title, body, data, icon: '/icons/icon-192.png' });
    await Promise.allSettled(
      this.subscriptions.map(sub => webpush.sendNotification(sub, payload).catch(()=>{}))
    );
  }

  async sendNotification(sub: any, title: string, body: string) {
    const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.png' });
    await webpush.sendNotification(sub, payload).catch(()=>{});
  }
}
