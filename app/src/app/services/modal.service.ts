import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  output,
  OutputEmitterRef,
  Type,
} from '@angular/core';
import {Styles} from "../models/constants/styles";
import {ModelOnCloseDto} from "../models/model-on-close-dto";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  modal?: HTMLElement;
  private activeRef?: ComponentRef<object>;
  modalStyle = Styles.modal;

  onClose: OutputEmitterRef<ModelOnCloseDto | undefined> = output<ModelOnCloseDto | undefined>();


  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector
  ) {
  }

  public show(component: Type<object>, inputs?: object) {
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const modalRef = modalFactory.create(this.injector);

    if (inputs) {

      for (const [key, value] of Object.entries(inputs)) {
        (modalRef.instance as { [key: string]: unknown })[key] = value;
      }
    }

    this.applicationRef.attachView(modalRef.hostView);
    this.activeRef = modalRef;

    const element = (modalRef.hostView as EmbeddedViewRef<object>).rootNodes[0] as HTMLElement;
    this.modal = document.createElement('div');
    this.modal.className = this.modalStyle;
    this.modal.style.zIndex = '50';
    this.modal.appendChild(element);
    document.body.appendChild(this.modal);

    requestAnimationFrame(() => {
      this.modal?.classList.remove('translate-y-full', 'opacity-0');
      this.modal?.classList.add('translate-y-0', 'opacity-100');
    });
  }

  public close(data?: ModelOnCloseDto | undefined) {
    if (this.modal) {
      const modal = this.modal;
      this.modal.classList.add('translate-y-full', 'opacity-0');
      this.modal.addEventListener('transitionend', () => {
        document.body.removeChild(modal);
        this.activeRef?.destroy();
        this.activeRef = undefined;
        this.modal = undefined;
      }, {once: true});
    }
    this.onClose.emit(data);
  }

}
