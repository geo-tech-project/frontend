import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent implements OnInit {

  // url to run on -> localhost or ip
  APIURL = environment.api_url;

  markdown;

  constructor(private http: HttpClient,) { }

  ngOnInit(): void {
    this.http.get(this.APIURL + '/markdown', {responseType: 'text'}).subscribe({
      next: (data) => {
        this.markdown = data;
      },
      error: (error) => {
        console.log(error);
      }
    });  
  }

}
