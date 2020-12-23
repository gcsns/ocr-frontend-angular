import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { OcrService } from '../ocr.service';

@Component({
  selector: 'app-baseocr',
  templateUrl: './baseocr.component.html',
  styleUrls: ['./baseocr.component.scss'],
})
export class BaseocrComponent {
  uploading = false;
  fileList: NzUploadFile[] = [];

  constructor(
    private msg: NzMessageService,
    private baseOcrService: OcrService,
    private router: Router
  ) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  handleUpload(): void {
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    this.fileList.forEach((file) => {
      console.log(file);
    });
  }

  imageSrc;
  fileType: string;
  handleInputChange(e) {
    this.uploading = true;
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    var pattern = /image-*/;
    var reader = new FileReader();
    this.fileType = file.type;
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
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
}

