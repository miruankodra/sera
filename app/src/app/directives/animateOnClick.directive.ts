import { Directive, ElementRef, HostListener, Input, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAnimateOnClick]',
  standalone: true,
})
export class AnimateOnClickDirective {

  @Input() 'behaviour'?: string;

  constructor( private elRef: ElementRef, private render: Renderer2 ) { }


  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {  

    const el = this.elRef.nativeElement;
    let animationClass = null;
    
    switch (this.behaviour) {
      case 'pulse':
        animationClass = 'animate-pulse';
        break;

      case 'bounce':
        animationClass = 'animate-bounce';
        break;

      case 'rotate':
        this.rotateEffect(el);
        break;

      case 'ripple':
        this.rippleEffect(el, event);
        break;

      default:
        this.rippleEffect(el, event);
        break;
    }

    if (animationClass) {
      this.render.addClass(el, animationClass);
      setTimeout(() => {
        this.render.removeClass(el, animationClass);
      }, 500);
    }  
  }


  private rippleEffect(el: HTMLElement, event: MouseEvent){
    console.log('rippling');
    
    const rippleEl = document.createElement('span');
    rippleEl.className = 'ripple absolute bg-gray-400 opacity-50 rounded-full transform scale-0';

    el.appendChild(rippleEl);

    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    rippleEl.style.width = rippleEl.style.height = `${size}px`;
    rippleEl.style.left = `${x}px`;
    rippleEl.style.top = `${y}px`;

    this.render.addClass(rippleEl, 'animate-ripple');
    setTimeout(() => {
      this.render.removeClass(rippleEl, 'animate-ripple');
    }, 600);
  }

  private rotateEffect(el: HTMLElement): void {
    el.classList.toggle('rotate-90');
    // const isRotated = el.classList.contains('rotate-90');

    // if (isRotated) {
    //   el.classList.remove('rotate-90');
    //   el.classList.add('rotate-0');
    // } else {
    //   el.classList.remove('rotate-0');
    //   el.classList.add('rotate-90');
    // }
  }

}
