import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, MatSliderModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy
{
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
    public isPlaying: boolean = false;
    public isFullScreen: boolean = false;
    public volume: number = 100;
    public muted: boolean = false;
    public showControls: boolean = false;
    public progress: number = 0;

    private _isDragging: boolean = false;
    private _lastVolume: number = 10;
    private _progressInterval: any;

    public getPlayPauseButtonText = () => this.isPlaying ? 'Pause' : 'Weiter';
    public getVolumeInPercent = () => (Math.round(this.volume)).toString();
    public getVolumeButtonText = () => (this.muted == true) ? 'stumm' : 'laut';

    constructor(private elementRef: ElementRef) { }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent)
    {
        switch (event.key)
        {
            case "ArrowRight":
                this.skipVideo(10);
                break;
            case "ArrowLeft":
                this.skipVideo(-10);
                break;
            case " ":
                this.togglePlayPause();
                break;
        }
    }

    togglePlayPause(): void
    {
        if (this.videoPlayer.nativeElement.paused)
        {
            this.videoPlayer.nativeElement.play();
            this.isPlaying = true;
            this._progressInterval = setInterval(() =>
            {
                this.updateProgressBar();
            }, 500);
        } else
        {
            this.videoPlayer.nativeElement.pause();
            this.isPlaying = false;
            clearInterval(this._progressInterval);
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
            } else if (elem.mozRequestFullScreen)
            {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen)
            {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen)
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
        } else
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

    ngOnInit()
    {
        this.elementRef.nativeElement.addEventListener('mousemove', this.dragProgress.bind(this));
        this.elementRef.nativeElement.addEventListener('mouseup', this.stopDragging.bind(this));
    }

    ngOnDestroy()
    {
        this.elementRef.nativeElement.removeEventListener('mousemove', this.dragProgress.bind(this));
        this.elementRef.nativeElement.removeEventListener('mouseup', this.stopDragging.bind(this));
        clearInterval(this._progressInterval);
    }

    updateProgressBar()
    {
        const video: HTMLVideoElement = this.videoPlayer.nativeElement;
        const progressPercent = (video.currentTime / video.duration) * 100;
        this.progress = progressPercent;
    }

    seekVideo(event: MouseEvent)
    {
        if (!this._isDragging)
        {
            const progressBar: HTMLElement = event.currentTarget as HTMLElement;
            const rect = progressBar.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            const video: HTMLVideoElement = this.videoPlayer.nativeElement;
            video.currentTime = (percentage * video.duration) / 100;
        }
    }

    startDragging(event: MouseEvent)
    {
        this._isDragging = true;
        this.dragProgress(event);
    }

    dragProgress(event: MouseEvent)
    {
        if (this._isDragging)
        {
            const progressBar: HTMLElement = this.elementRef.nativeElement.querySelector('.progress-bar-container');
            const rect = progressBar.getBoundingClientRect();
            const x = event.clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            percentage = Math.max(0, Math.min(100, percentage));
            this.progress = percentage;
            const video: HTMLVideoElement = this.videoPlayer.nativeElement;
            video.currentTime = (percentage * video.duration) / 100;
        }
    }

    stopDragging()
    {
        this._isDragging = false;
    }
}
