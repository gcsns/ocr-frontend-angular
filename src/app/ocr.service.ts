import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  constructor(
    private http: HttpClient
  ) { }


  public uploadSingle(files: FileList) {
    let formData = new FormData();
    formData.append("image", files[0], files[0].name);
    return this.http.post('http://localhost:1234/upload', formData);
  }



  public uploadBlob(blobObj:Blob) {
    let formData = new FormData();
    formData.append("image", blobObj, "image");
    return this.http.post("http://localhost:1234/upload", formData);
  }



  private ocrData: any;
  public setPassportData(data) {
    this.ocrData = data;
  }


  public getPassportData() {
    return this.ocrData;
  }
}
