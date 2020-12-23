import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
    return this.http.post(`${environment.apiUrl}/upload`, formData);
  }



  public uploadToRegulaService(uri: string) {
    return this.http.post(`${environment.regulaUrl}/api/process`, {
      "processParam": {
          "scenario": "FullProcess",
          "resultTypeOutput": [
              1,
              6,
              9,
              15
          ],
          "doublePageSpread": true
      },
      "List": [
          {
              "page_idx": 0,
              "Format": ".png",
              "LightIndex": 6,
              "ImageData": {
                  "image": uri
              }
          }
      ]
    })
  }

  public uploadBlob(blobObj:Blob, initiatePostTimeout=false) {
    let formData = new FormData();
    formData.append("image", blobObj, "image");
    return this.http.post(`${environment.apiUrl}/upload?initiatePostTimeout=${initiatePostTimeout}`, formData);
  }



  private ocrData: any;
  public setPassportData(data) {
    this.ocrData = data;
  }


  public getPassportData() {
    return this.ocrData;
  }
}
