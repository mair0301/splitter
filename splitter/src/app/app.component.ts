import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent
{
    title = 'splitter';

    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
    isPlaying: boolean = false;

    getButtonText = () => this.isPlaying ? 'Pause' : 'Weiter';
    
    togglePlayPause(): void
    {
        if (this.videoPlayer.nativeElement.paused)
        {
            this.videoPlayer.nativeElement.play();
            this.isPlaying = true;
        } else
        {
            this.videoPlayer.nativeElement.pause();
            this.isPlaying = false;
        }
    }
}
