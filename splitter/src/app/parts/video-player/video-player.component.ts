import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-video-player',
    standalone: true,
    imports: [],
    templateUrl: './video-player.component.html',
    styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent
{
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
    isPlaying: boolean = false;
    isFullScreen: boolean = false;
    volume: number = 1;

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
}
