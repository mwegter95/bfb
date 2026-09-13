import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Meta } from '@angular/platform-browser';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FORM_ENDPOINT, SITE } from '../site.config';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-connect',
  imports: [ReactiveFormsModule],
  templateUrl: './connect.html',
})
export class ConnectPage {
  private readonly http = inject(HttpClient);

  protected readonly site = SITE;
  protected readonly formEnabled = SITE.web3formsKey.trim().length > 0;

  protected readonly state = signal<SendState>('idle');
  protected readonly sending = computed(() => this.state() === 'sending');

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
    // Hidden from people, catnip for bots. Web3Forms drops anything that fills it.
    botcheck: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Get in touch with Ashley Belisle about a city issue, or get involved in the ' +
        'write-in campaign for Birchwood Village City Council.',
    });
  }

  protected invalid(field: 'name' | 'email' | 'message'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.sending()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.state.set('idle');
      return;
    }

    const value = this.form.getRawValue();
    this.state.set('sending');

    this.http
      .post<{ success: boolean; message?: string }>(FORM_ENDPOINT, {
        access_key: SITE.web3formsKey,
        subject: `New message from ${value.name} — belisleforbirchwood.com`,
        from_name: 'Belisle for Birchwood website',
        name: value.name,
        email: value.email,
        message: value.message,
        botcheck: value.botcheck,
      })
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.state.set('sent');
            this.form.reset();
          } else {
            this.state.set('error');
          }
        },
        error: () => this.state.set('error'),
      });
  }
}
