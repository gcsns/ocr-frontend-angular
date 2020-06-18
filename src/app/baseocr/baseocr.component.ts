import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
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
export class BaseocrComponent implements OnInit, AfterViewInit{

  constructor(
    private msg: NzMessageService,
    private ocrService: OcrService,
    private router: Router
  ) { }


  description: string;
  text: string;
  @ViewChild('ocrscreen') ocrscreen: any;
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
  public multipleWebcamsAvailable = true;
  public imageQuality: ImageSmoothingQuality = "high";
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    width: {ideal: 800},
    height: {ideal: 500},
    // frameRate: {max: 60, min: 30}
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

  ngAfterViewInit() {
    this.checkDimension();
  }


  allowDetection: boolean = true;
  checkDimension() {
    window.addEventListener('resize', (resizeEvent: any)=>{
      if(resizeEvent.currentTarget.innerHeight > resizeEvent.currentTarget.innerWidth) {
        this.allowDetection = false;
      }else{
        this.allowDetection = true;
      }
    });

    if(window.innerHeight > window.innerWidth) {
      this.allowDetection = false;
    }
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
  totalCount = 13;

  successCounter = 0
  totalSuccessCountReq = 5;
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
    this.shortCircuitCheck(); //check for validity before moving for next set of data
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


  // since we are only concerned with these fields to be 100% correct
  shortCircuitCheck() {
    let requiredValidators = ["firstName", "lastName", "documentNumber", "sex"];
    let lovr = this.validRecords.length; //length of valid records
    let comparisons=2; //continuous frames that will be checked is + 1
    let boolResult = true;
    if(lovr<=2) {
      return;
    }

    for (let k = lovr - 1; k >= lovr - comparisons; k--) {
      for (let validator of requiredValidators) {
        boolResult = boolResult && (this.validRecords[lovr - k].fields[validator] === this.validRecords[lovr - k - 1].fields[validator])
      }
      console.log(boolResult);
    }

    if(boolResult) {
      console.log("validity check passed");
      this.ocrService.setPassportData(this.validRecords);
      this.router.navigate(['passportinfo']);
    }
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

    this.shortCircuitCheck();
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
