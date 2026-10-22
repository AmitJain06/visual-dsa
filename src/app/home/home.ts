import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  imports: [ButtonModule],
  template: `
    <main class="home">
      <section class="welcome" aria-labelledby="welcome-title">
        <span class="eyebrow"><i class="pi pi-sparkles" aria-hidden="true"></i> VISUAL DSA</span>
        <h1 id="welcome-title">Learn algorithms<br /><span>by seeing them.</span></h1>
        <p>Your space for exploring data structures and algorithms, one clear step at a time.</p>
        <p-button label="Explore visualizations" icon="pi pi-arrow-right" iconPos="right" />
      </section>
      <div class="orbit orbit-one" aria-hidden="true"></div>
      <div class="orbit orbit-two" aria-hidden="true"></div>
      <div class="node node-one" aria-hidden="true">01</div>
      <div class="node node-two" aria-hidden="true">10</div>
      <div class="node node-three" aria-hidden="true">11</div>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; }
    .home { position: relative; display: grid; min-height: 100vh; place-items: center; overflow: hidden; padding: 2rem; }
    .welcome { position: relative; z-index: 1; width: min(100%, 720px); text-align: center; }
    .eyebrow { display: inline-flex; align-items: center; gap: .55rem; color: #635bdb; font-size: .75rem; font-weight: 700; letter-spacing: .16em; }
    h1 { margin: 1.4rem 0 1rem; color: #202235; font-size: clamp(3rem, 8vw, 5.8rem); line-height: .99; letter-spacing: -.065em; }
    h1 span { color: #7068e8; }
    p { max-width: 470px; margin: 0 auto 1.8rem; color: #74778b; font-size: 1.05rem; line-height: 1.7; }
    .orbit { position: absolute; width: min(72vw, 700px); aspect-ratio: 1; border: 1px solid #e7e8f2; border-radius: 50%; }
    .orbit-one { transform: scaleY(.45) rotate(-25deg); }
    .orbit-two { transform: scaleY(.45) rotate(35deg); }
    .node { position: absolute; display: grid; width: 3.2rem; aspect-ratio: 1; place-items: center; border: 1px solid #deddfb; border-radius: 1rem; background: #fff; box-shadow: 0 12px 36px #43417a12; color: #7068e8; font: 600 .85rem ui-monospace, monospace; }
    .node-one { top: 25%; left: 22%; }
    .node-two { top: 34%; right: 21%; }
    .node-three { right: 28%; bottom: 20%; }
    @media (max-width: 600px) { .orbit { width: 120vw; } .node-one { left: 8%; } .node-two { right: 7%; } }
  `
})
export class Home {}
