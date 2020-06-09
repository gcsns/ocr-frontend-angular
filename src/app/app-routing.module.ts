import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PassportDetailsComponent } from './passport-details/passport-details.component';
import { BaseocrComponent } from './baseocr/baseocr.component';


const routes: Routes = [
  {path: '', component: BaseocrComponent},
  {path: 'passportinfo', component: PassportDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
