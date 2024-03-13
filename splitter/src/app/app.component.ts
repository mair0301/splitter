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
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
    public isPlaying: boolean = false;
    public isFullScreen: boolean = false;
    public volume: number = 1;

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

    toggleFullScreen(): void
    {
        const elem = this.videoPlayer.nativeElement as any;
        if (!this.isFullScreen)
        {
            if (elem.requestFullscreen)
            {
                elem.requestFullscreen();
            }
            else if (elem.mozRequestFullScreen)
            {
                elem.mozRequestFullScreen();
            }
            else if (elem.webkitRequestFullscreen)
            {
                elem.webkitRequestFullscreen();
            }
            else if (elem.msRequestFullscreen)
            {
                elem.msRequestFullscreen();
            }
        }

        this.isFullScreen = !this.isFullScreen;
    }

    adjustVolume(direction: string): void
    {
        if (direction === 'up')
        {
            if (this.volume < 1)
            {
                this.volume += 0.1;
            }
        } else if (direction === 'down')
        {
            if (this.volume > 0)
            {
                this.volume -= 0.1;
            }
        }
        this.videoPlayer.nativeElement.volume = this.volume;
    }

    skipVideo(seconds: number) 
    {
        const currentTime = this.videoPlayer.nativeElement.currentTime;
        let newTime = currentTime + seconds;
        newTime = Math.max(0, Math.min(this.videoPlayer.nativeElement.duration, newTime));
        this.videoPlayer.nativeElement.currentTime = newTime;
    }
}
