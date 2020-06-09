import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OcrService } from '../ocr.service';

@Component({
  selector: 'app-passport-details',
  templateUrl: './passport-details.component.html',
  styleUrls: ['./passport-details.component.scss']
})
export class PassportDetailsComponent implements OnInit {

  constructor(
    private ocrService: OcrService
  ) { }

  passportData;
  objectkeys = Object.keys;
  ngOnInit(): void {
    this.passportData = this.ocrService.getPassportData();
  }
}
