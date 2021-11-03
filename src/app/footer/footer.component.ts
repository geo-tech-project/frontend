import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer is-dark">
      <div class="content has-text-centered">
        <p>
          <a> Software Project WiSe 21/22 by xx xx xx xx xx </a>
        </p>
      </div>
    </footer>
  `,
  styles: [],
})
export class FooterComponent implements OnInit {
  constructor() {}
  ngOnInit() {
  }
}
