import { Injectable, ɵclearResolutionOfComponentResourcesQueue } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';
const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class PhotoService {
  
  public photos:Photo[]=[];
  private PHOTO_STORAGE: string = "photos";
 
  constructor() { }
  

  public async addNewPhoto(){
    //Tomar Foto
    const takepicture=await Camera.getPhoto({
      resultType:CameraResultType.Uri,
      source:CameraSource.Camera,
      quality:100
    });

    const guardarImagen=await this.savePicture(takepicture);
    this.photos.unshift(guardarImagen);
   
    
  }
  private async savePicture (cameraPhoto:CameraPhoto){
    const base64Data=await this.readAsBase64(cameraPhoto);

    const fileName=new Date().getTime+'.jpeg';
    await Filesystem.writeFile({
      path:fileName,
      data:base64Data,
      directory: FilesystemDirectory.Data,
    });

    return await this.getPhotoFile(cameraPhoto,fileName);
  }

  private async readAsBase64(cameraPhoto:CameraPhoto){
    const response =await fetch(cameraPhoto.webPath!);
    const blob=await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  convertBlobToBase64=(blob:Blob) =>new Promise((resolve,reject)=>{
    const reader =new FileReader;
    reader.onerror=reject;
    reader.onload=()=>{
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  private async getPhotoFile(cameraPhoto:CameraPhoto,
    fileName:string):Promise<Photo>{
    return {
      filepath:fileName,
      webviewPath:cameraPhoto.webPath
    };
  }
}

interface Photo{
  filepath:string,
  webviewPath:string,
  base64?:string
}
