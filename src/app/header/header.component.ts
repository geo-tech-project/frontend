import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <section class="section">
      <nav id="navbar" class="navbar is-dark is-fixed-top">
        <div class="navbar-brand">
          <a class="navbar-item" routerLink="/" routerLinkActive="active">
            <h2><b>Geosoft2</b></h2>
          </a>
        </div>
        <div class="navbar-menu">
          <div class="navbar-start">
            <span class="navbar-item" routerLink="/" routerLinkActive="active">
              <a>
                <span class="icon">
                  <i class="fa fa-home"></i>
                </span>
                <span>Home</span>
              </a>
            </span>
            <span
              class="navbar-item"
              routerLink="/documentation"
              routerLinkActive="active"
            >
              <a>
                <span class="icon">
                  <i class="fa fa-book"></i>
                </span>
                <span>Documentation</span>
              </a>
            </span>
            <span
              class="navbar-item"
              routerLink="/map"
              routerLinkActive="active"
            >
              <a>
                <span class="icon">
                  <i class="fa fa-map"></i>
                </span>
                <span>Map</span>
              </a>
            </span>
          </div>
          <div class="navbar-end">
            <span class="navbar-item">
              <a href="https://github.com/Geosoft2-WiSe21-22" target="_blank">
                <span class="icon">
                  <i class="fa fa-code"></i>
                </span>
                <span>Source Code</span>
              </a>
            </span>
          </div>
        </div>
      </nav>
    </section>
  `,
  styles: [],
})
export class HeaderComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
