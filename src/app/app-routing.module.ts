import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';

import { LandingpageComponent } from './landingpage/landingpage.component';
import { DemoComponent } from './demo/demo.component';
import { ResultComponent } from './result/result.component';
import { DemoResultComponent } from './demo-result/demo-result.component';

const routes: Routes = [
  {
    path: '',
    component: LandingpageComponent,
  },
  {
    path: 'map',
    component: MapComponent,
  },
  {
    path: 'demo',
    component: DemoComponent,
  },
  {
    path: 'result',
    component: ResultComponent,
  },
  {
    path: 'demo-result',
    component: DemoResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
