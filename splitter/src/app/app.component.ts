import { Component } from '@angular/core';
import { VideoPlayerComponent } from './parts/video-player/video-player.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [VideoPlayerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent
{
    
}
