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
    this.trigger.next();
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


  arrayOfImages: any[] = [];
  counter = 0;
  validRecords = [];
  totalCount = 10;

  successCounter = 0
  totalSuccessCountReq = 1;
  postTimeout = false;
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    if(!this.postTimeout) {
      this.handlePreTimeout();
    }else{
      this.handlePostTimeout();
    }

  }



  handlePreTimeout() {
    this.arrayOfImages.push(this.webcamImage.imageAsDataUrl);

    if (this.counter >= this.totalCount && this.validRecords.length === 0) {
      console.log(this.validRecords);
      this.msg.error("Timed out!, moving to post timeout");
      this.counter = 0;
      this.successCounter = 0;
      this.arrayOfImages = []
      this.postTimeout = true;
      return this.trigger.next();
    }

    const imageblob = this.b64toBlob(this.webcamImage.imageAsDataUrl);
    this.ocrService.uploadBlob(imageblob).subscribe(data => {
      this.counter++;
      this.successCounter++;
      if (this.successCounter >= this.totalSuccessCountReq) {
        this.ocrService.setPassportData(this.validRecords);
        this.router.navigate(['passportinfo']);
      }
      this.validRecords.push(data);
      this.trigger.next();
    }, error => {
      this.msg.warning("Please hold your card firmly!");
      this.counter++;
      this.trigger.next();
    })
  }



  postTimeoutTrialCount = 0;
  handlePostTimeout() {
    this.arrayOfImages.push(this.webcamImage.imageAsDataUrl);

    if (this.counter > this.totalCount && this.validRecords.length === 0) {
      console.log(this.validRecords);
      this.msg.error("Post Timeout failed! No results to show");
      this.counter = 0;
      return;
    }

    const imageblob = this.b64toBlob(this.webcamImage.imageAsDataUrl);
    this.ocrService.uploadBlob(imageblob, true).subscribe(data => {
      this.counter++;
      this.successCounter++;
      if (this.successCounter >= this.totalSuccessCountReq) {
        this.ocrService.setPassportData(this.validRecords);
        this.router.navigate(['passportinfo']);
      }
      this.validRecords.push(data);
      this.trigger.next();
    }, error => {
      this.msg.warning("Please hold your card firmly!");
      this.counter++;
      this.trigger.next();
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