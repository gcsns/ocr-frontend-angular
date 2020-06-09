import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OcrService } from '../ocr.service';
import { WebcamInitError, WebcamImage, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject, timer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-baseocr',
  templateUrl: './baseocr.component.html',
  styleUrls: ['./baseocr.component.scss']
})
export class BaseocrComponent {

  constructor(
    private msg: NzMessageService,
    private ocrService: OcrService,
    private router: Router
  ) { }


  description: string;
  text: string;
  uploadSingle(event) {
    this.ocrService.uploadSingle(event.target.files).subscribe((data: any) => {
      this.description = data.textAnnotations.description;
      this.text = data.fullTextAnnotation.text;
    }, error => {
      alert(error.message);
    })
  }

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    // let counter = 0;
    // const frameInterval = setInterval(()=>{
      this.trigger.next();
    //   counter++;
    //   console.log(counter);
    // }, 1000);


    // setTimeout(()=>{
    //   clearInterval(frameInterval);
    // }, 4000);
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }


  arrayOfImages:any[] = [];
  counter = 0;
  public handleImage(webcamImage: WebcamImage): void {
    if(++this.counter > 5) {
      this.msg.error("Timed out!, Please try again");
      this.counter = 0;
      return;
    }
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;

    this.arrayOfImages.push(this.webcamImage.imageAsDataUrl);

    const imageblob = this.b64toBlob(this.webcamImage.imageAsDataUrl);
    this.ocrService.uploadBlob(imageblob).subscribe(data=>{
      this.ocrService.setPassportData(data);
      this.router.navigate(['passportinfo']);
    }, error=>{
      setTimeout(()=>{
        this.trigger.next();
      }, 500)
      console.log(error);
    })
  }


  b64toBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}
