import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-meet-ashley',
  imports: [RouterLink],
  templateUrl: './meet-ashley.html',
})
export class MeetAshleyPage {
  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Meet Ashley Belisle — Birchwood Village resident, Connections Committee member, ' +
        'and write-in candidate for City Council.',
    });
  }
}
