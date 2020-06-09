import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoNgZorroAntdModule } from './antd.module';
import { BaseocrComponent } from './baseocr/baseocr.component';
import { HttpClientModule } from '@angular/common/http';
import {WebcamModule} from 'ngx-webcam';
import { FormsModule } from '@angular/forms';
import { VideoCaptureComponent } from './video-capture/video-capture.component';
import { PassportDetailsComponent } from './passport-details/passport-details.component';


@NgModule({
  declarations: [
    AppComponent,
    BaseocrComponent,
    VideoCaptureComponent,
    PassportDetailsComponent
  ],
  imports: [
    WebcamModule,
    DemoNgZorroAntdModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
