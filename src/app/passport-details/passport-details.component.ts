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

  passports: any;
  passportData: any;
  unmatched: any;
  objectkeys = Object.keys;
  bagOfValues;
  fieldsCount;
  ngOnInit(): void {
    this.bagOfValues = {};
    this.passports = this.ocrService.getPassportData();

    this.filterValidPassports();
    this.passportData = this.passports[0];

    // name validation

    // checksum validation as a whole

    this.fieldsCount = this.countOfAllFields()
  }


  filterValidPassports() {
    this.passports = this.passports.filter(passport=>!!passport.valid); // checksum as a whole
    return this.passports;
  }


  dict;
  countOfAllFields() {
    this.dict = {}
    this.passports.forEach(passport=>{
      Object.keys(passport.fields).forEach(key=>{
        const value = passport.fields[key];

        // if the label doesnot exist
        if(!this.dict[key] || !this.dict[key][value]) {
          this.dict[key] = { ...this.dict[key], [value]: 1 }
        }
        else if(this.dict[key][value]) {
          this.dict[key][value] = this.dict[key][value]++;
        }
      })
    });

    console.log(this.dict)
    return this.dict;
  }
}
