import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, MatSliderModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent
{
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
    public isPlaying: boolean = false;
    public isFullScreen: boolean = false;
    public volume: number = 100;
    public muted: boolean = false;
    public showControls: boolean = false;
    public progress: number = 0;

    private _lastVolume: number = 10;

    public getPlayPauseButtonText = () => this.isPlaying ? 'Pause' : 'Weiter';
    public getVolumeInPercent = () => (Math.round(this.volume)).toString();
    public getVolumeButtonText = () => (this.muted == true) ? 'stumm' : 'laut';

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

        this.updateProgressBar();
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

    toggleMuteVideo()
    {
        if (this.muted)
        {
            this.muted = false;
            this.volume = this._lastVolume;
            this.onVolChange(this.volume);
        }
        else
        {
            this.muted = true;
            this._lastVolume = this.volume;
            this.onVolChange(0);
        }
    }

    skipVideo(seconds: number) 
    {
        const currentTime = this.videoPlayer.nativeElement.currentTime;
        let newTime = currentTime + seconds;
        newTime = Math.max(0, Math.min(this.videoPlayer.nativeElement.duration, newTime));
        this.videoPlayer.nativeElement.currentTime = newTime;

        this.updateProgressBar();
    }

    onMouseEnter()
    {
        this.showControls = true;
    }

    onMouseLeave()
    {
        this.showControls = false;
    }

    onVolChange(e: number)
    {
        this.volume = e;
        this.videoPlayer.nativeElement.volume = (this.volume / 100);
    }

    updateProgressBar()
    {
        const video: HTMLVideoElement = this.videoPlayer.nativeElement;
        const progressPercent = (video.currentTime / video.duration) * 100;
        this.progress = progressPercent;
    }

    seekVideo(event: MouseEvent)
    {
        const progressBar: HTMLElement = event.currentTarget as HTMLElement;
        const rect = progressBar.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const video: HTMLVideoElement = this.videoPlayer.nativeElement;
        video.currentTime = (percentage * video.duration) / 100;

        this.updateProgressBar();
    }
}
