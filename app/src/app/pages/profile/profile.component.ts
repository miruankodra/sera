import {Component} from '@angular/core';
import { SeTitleComponent } from "../../components/shared/se-title/se-title.component";
import { SeItemComponent } from "../../components/shared/se-item/se-item.component";

@Component({
  selector: 'se-profile',
  standalone: true,
  imports: [SeTitleComponent, SeItemComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

}
