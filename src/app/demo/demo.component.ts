import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent implements OnInit {
  APIURL = environment.api_url;
  json = {
    whereareyoufrom: "demo",
    topleftlat: 51.946286720328104,
    topleftlng: 7.5971644627228905,
    bottomleftlat: 51.975309509611826,
    bottomleftlng: 7.5971644627228905,
    bottomrightlat: 51.975309509611826,
    bottomrightlng: 7.652018947455736,
    toprightlat: 51.946286720328104,
    toprightlng: 7.652018947455736,
    option: 'model',
    algorithm: 'rf',
    startDate: '2021-05-31T22:00:00.000Z',
    endDate: '2021-08-30T22:00:00.000Z',
    filename: 'model.RDS',
    resolution: '10',
    channels: ['B02', 'B03', 'B04', 'SCL'],
    coverage: 20,
    mtry: 2,
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  runDemo() {
    document.getElementById('progressModal').classList.add('is-active');
    this.http.post(this.APIURL + '/start', this.json).subscribe({
      next: (data) => {
        console.log('Data', data);
        document
            .getElementById('progressModal')
            .classList.remove('is-active');
        this.router.navigate(['result']);
      },
    });
  }
}
