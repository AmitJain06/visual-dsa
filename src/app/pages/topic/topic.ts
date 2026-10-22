import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-topic-page',
  imports: [RouterLink],
  templateUrl: './topic.html',
  styleUrl: './topic.scss'
})
export class TopicPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly pageTitle = toSignal(
    this.route.paramMap.pipe(map((params) => this.toTitle(params.get('topic') ?? 'Visualization'))),
    { initialValue: 'Visualization' }
  );
  protected readonly sectionTitle = toSignal(
    this.route.paramMap.pipe(map((params) => this.toTitle(params.get('section') ?? ''))),
    { initialValue: '' }
  );

  private toTitle(value: string): string {
    return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }
}
