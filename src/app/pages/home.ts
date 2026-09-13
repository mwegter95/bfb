import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class HomePage {
  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Ashley Belisle is running a write-in campaign for Birchwood Village City Council. ' +
        'Commitment to neighbors. Stewardship of infrastructure. A sustainable future for Birchwood.',
    });
  }
}
