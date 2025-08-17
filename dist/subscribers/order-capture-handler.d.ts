import { SubscriberConfig, SubscriberArgs } from '@medusajs/medusa';
export default function orderCaptureHandler({ data, eventName, container, pluginOptions, }: SubscriberArgs<Record<string, any>>): Promise<void>;
export declare const config: SubscriberConfig;
