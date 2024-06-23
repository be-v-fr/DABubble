import { Component } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";

@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [MessageItemComponent, MessageBoxComponent]
})
export class ThreadComponent {

}
