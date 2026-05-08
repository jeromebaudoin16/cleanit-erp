import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingPosition } from './tracking.entity';
import { Alerte } from './alert.entity';

const ZONES: Record<string,{lat:number,lng:number,rayon:number,nom:string}> = {
  bureau_dla: {lat:4.0511,lng:9.7085,rayon:150,nom:'Bureau Douala'},
  bureau_yde: {lat:3.8667,lng:11.5167,rayon:150,nom:'Bureau Yaoundé'},
  'DLA-001':  {lat:4.0511,lng:9.7085,rayon:300,nom:'Site Akwa Douala'},
  'DLA-002':  {lat:4.0612,lng:9.7234,rayon:300,nom:'Site Bonaberi'},
  'YDE-001':  {lat:3.8480,lng:11.5021,rayon:300,nom:'Site Yaoundé'},
  'KRI-001':  {lat:2.9395,lng:9.9087,rayon:300,nom:'Site Kribi'},
  'GAR-001':  {lat:9.3019,lng:13.3920,rayon:300,nom:'Site Garoua'},
  'LIM-001':  {lat:4.0167,lng:9.2000,rayon:300,nom:'Site Limbé'},
};

function calcDist(a:number,b:number,c:number,d:number):number{
  const R=6371000,dL=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180;
  const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

@WebSocketGateway({cors:{origin:'*'},namespace:'/tracking'})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers = new Map<string,{socketId:string,userId:string,userName:string,userType:string,lastPos:any}>();

  constructor(
    @InjectRepository(TrackingPosition) private posRepo: Repository<TrackingPosition>,
    @InjectRepository(Alerte) private alertRepo: Repository<Alerte>,
  ){}

  handleConnection(client:Socket){ console.log(`[WS] Connect: ${client.id}`); }

  handleDisconnect(client:Socket){
    for(const [key,user] of this.connectedUsers.entries()){
      if(user.socketId===client.id){
        this.connectedUsers.delete(key);
        this.server.emit('user_offline',{userId:user.userId});
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() data:{userId:string,userName:string,userType:string,deviceId:string},@ConnectedSocket() client:Socket){
    this.connectedUsers.set(data.userId,{socketId:client.id,userId:data.userId,userName:data.userName,userType:data.userType,lastPos:null});
    this.server.emit('user_online',{userId:data.userId,userName:data.userName});
    client.emit('registered',{success:true,count:this.connectedUsers.size});
  }

  @SubscribeMessage('position_update')
  async handlePosition(@MessageBody() data:{userId:string,userName:string,userType:string,lat:number,lng:number,accuracy:number,speed:number,zoneCode:string,deviceId:string,batteryLevel:number,networkType:string}){
    const zone=ZONES[data.zoneCode];
    let horsZone=false,distanceZone=0;
    if(zone){distanceZone=calcDist(data.lat,data.lng,zone.lat,zone.lng);horsZone=distanceZone>zone.rayon;}
    const pos=await this.posRepo.save({...data,horsZone,distanceZone:Math.round(distanceZone),timestamp:Date.now()});
    const user=this.connectedUsers.get(data.userId);
    if(user) user.lastPos={lat:data.lat,lng:data.lng,horsZone,distanceZone};
    this.server.emit('position_update',{userId:data.userId,userName:data.userName,userType:data.userType,lat:data.lat,lng:data.lng,accuracy:data.accuracy,speed:data.speed,zoneCode:data.zoneCode,horsZone,distanceZone:Math.round(distanceZone),batteryLevel:data.batteryLevel,networkType:data.networkType,timestamp:Date.now()});
    if(horsZone){
      const alerte=await this.alertRepo.save({type:'hors_zone',userId:data.userId,userName:data.userName,zoneCode:data.zoneCode,message:`${data.userName} est à ${Math.round(distanceZone)}m du périmètre de ${zone?.nom}`,severite:distanceZone>1000?'critical':'high',statut:'open',metadata:{lat:data.lat,lng:data.lng,distanceZone}});
      this.server.emit('new_alert',alerte);
    }
    return pos;
  }

  @SubscribeMessage('get_live_positions')
  handleGetPositions(){
    return Array.from(this.connectedUsers.values()).filter(u=>u.lastPos).map(u=>({userId:u.userId,userName:u.userName,userType:u.userType,...u.lastPos}));
  }

  @SubscribeMessage('acknowledge_alert')
  async handleAck(@MessageBody() data:{alertId:string,managerId:string}){
    await this.alertRepo.update(data.alertId,{statut:'acknowledged',acknowledgedBy:data.managerId});
    this.server.emit('alert_updated',{alertId:data.alertId,statut:'acknowledged'});
  }
}
