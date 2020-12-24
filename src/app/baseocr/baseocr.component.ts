import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { OcrService } from '../ocr.service';
import { WebcamInitError, WebcamImage, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-baseocr',
  templateUrl: './baseocr.component.html',
  styleUrls: ['./baseocr.component.scss'],
})
export class BaseocrComponent implements AfterViewInit, OnInit{
  uploading = false;
  fileList: NzUploadFile[] = [];

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


  constructor(
    private baseOcrService: OcrService,
  ) {}


  ngOnInit() {
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

  imageSrc;
  fileType: string;
  mapping = {
    2:"Passport Number",
    3:"Expiry",
    4:"Date of issue",
    5:"DOB",
    8:"SurName",
    9:"Given Name",
    11:"Citizensip",
    12:"Sex",
    26:"CountryCode",
    51:"MRZ",
  };

  handleInputChange(e) {
    this.uploading = true;
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    var pattern = /image-*/;
    var reader = new FileReader();
    this.fileType = file.type;
    // if (!file.type.match(pattern)) {
    //   alert('invalid format');
    //   return;
    // }
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  regularRes;
  mrzDetails: any;
  imageString: any;
  imageFormat: any;
  _handleReaderLoaded(e) {
    let reader = e.target;
    this.imageSrc = reader.result;
    this.callRegulaService();

  }

  callRegulaService() {
    console.log(this.imageSrc);
    this.baseOcrService
      .uploadToRegulaService(this.imageSrc)
      .subscribe((data: any) => {
        this.uploading = false;
        this.regularRes = data.ContainerList.List;
        this.mrzDetails = this.regularRes[
          this.regularRes.length - 1
        ].ListVerifiedFields;

        this.getGraphics(this.regularRes);
      });
  }

  signature: any;
  signatureFormat: string;
  profileImageObj: any;
  profileImage: string;
  useCamera = false;

  profileImageFormat: string;
  getGraphics(regularRes: any[]) {
    this.signature = "";
    this.profileImage = "";

    const imageObj = regularRes.filter((rr) => {
      return Object.keys(rr).includes('DocGraphicsInfo');
    });

    const signatureObj = imageObj[0].DocGraphicsInfo?.pArrayFields[1]?.image;
    if(signatureObj)
      this.signature = `data:image/${signatureObj.format.replace(".", "")};base64,` + signatureObj.image;



    this.profileImageObj = imageObj[0].DocGraphicsInfo?.pArrayFields[0]?.image;

    if(this.profileImageObj)
      this.profileImage = `data:image/${this.profileImageObj.format.replace(".", "")};base64,` + this.profileImageObj.image;
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

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    console.log(this.webcamImage);
    this.imageSrc = this.webcamImage.imageAsDataUrl;
    this.callRegulaService();
  }
}

