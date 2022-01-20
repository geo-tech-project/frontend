import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';

import { LandingpageComponent } from './landingpage/landingpage.component';
import { DemoComponent } from './demo/demo.component';
import { ResultComponent } from './result/result.component';
import { DocumentationComponent } from './documentation/documentation.component';

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
    path: 'documentation',
    component: DocumentationComponent,
  },
];

@NgModule({
  imports: [
    [
      RouterModule.forRoot(routes, {
        scrollPositionRestoration: 'top',
      }),
    ],
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
