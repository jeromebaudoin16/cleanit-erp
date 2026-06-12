import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { TrackingPosition } from './tracking.entity';
import { Alerte } from './alert.entity';
export declare class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private posRepo;
    private alertRepo;
    server: Server;
    private connectedUsers;
    constructor(posRepo: Repository<TrackingPosition>, alertRepo: Repository<Alerte>);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(data: {
        userId: string;
        userName: string;
        userType: string;
        deviceId: string;
    }, client: Socket): void;
    handlePosition(data: {
        userId: string;
        userName: string;
        userType: string;
        lat: number;
        lng: number;
        accuracy: number;
        speed: number;
        zoneCode: string;
        deviceId: string;
        batteryLevel: number;
        networkType: string;
    }): Promise<{
        horsZone: boolean;
        distanceZone: number;
        timestamp: number;
        userId: string;
        userName: string;
        userType: string;
        lat: number;
        lng: number;
        accuracy: number;
        speed: number;
        zoneCode: string;
        deviceId: string;
        batteryLevel: number;
        networkType: string;
    } & TrackingPosition>;
    handleGetPositions(): any[];
    handleAck(data: {
        alertId: string;
        managerId: string;
    }): Promise<void>;
}
