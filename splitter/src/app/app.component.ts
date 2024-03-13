import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, MatSliderModule, MatIconModule],
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
    public currentTime: string = this.getFormattedTime(0);
    public videoDuration: string = this.getFormattedTime(0);
    public showVideoInfo: boolean = false;

    private _isDragging: boolean = false;
    private _lastVolume: number = 10;
    private _progressInterval: any;

    public getPlayPauseButtonText = () => this.isPlaying ? 'pause' : 'play_arrow';
    public getFullscreenIcon = () => this.isFullScreen ? 'fullscreen_exit' : 'fullscreen';
    public getPlayPauseVideoInfoIcon = () => this.isPlaying ? 'play_arrow' : 'pause';
    public getVolumeInPercent = () => (Math.round(this.volume)).toString();
    public getVolumeButtonIcon = () => (this.muted == true) ? 'volume_off' : 'volume_down';

    constructor(private elementRef: ElementRef)
    {
        // this.videoDuration = this.getFormattedTime(this.videoPlayer.nativeElement?.duration ?? 0);
    }

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

    private showVideoInfoDialog()
    {
        this.showVideoInfo = !this.showVideoInfo;

        setTimeout(() =>
        {
            this.showVideoInfo = !this.showVideoInfo;
        }, 1500);
    }

    private getFormattedTime(value: number): string
    {
        const hours: number = Math.floor(value / 3600);
        const minutes: number = Math.floor((value % 3600) / 60);
        const seconds: number = Math.floor(value % 60);

        const hoursStr: string = (hours < 10) ? '0' + hours : hours.toString();
        const minutesStr: string = (minutes < 10) ? '0' + minutes : minutes.toString();
        const secondsStr: string = (seconds < 10) ? '0' + seconds : seconds.toString();

        return hoursStr + ':' + minutesStr + ':' + secondsStr;
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
            }, 1000);
        }
        else
        {
            this.videoPlayer.nativeElement.pause();
            this.isPlaying = false;
            clearInterval(this._progressInterval);
        }

        this.showVideoInfoDialog();
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
        } else
        {
            if (document.exitFullscreen)
            {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen)
            {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen)
            {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen)
            {
                document.msExitFullscreen();
            }
        }
    }

    toggleMuteVideo()
    {
        if (this.muted)
        {
            this.muted = false;
            this.volume = this._lastVolume;
            this.setVolume(this.volume);
        } else
        {
            this.muted = true;
            this._lastVolume = this.volume;
            this.setVolume(0);
        }
    }

    setVolume(e?: number)
    {
        if (e != null)
            this.volume = e;

        this.videoPlayer.nativeElement.volume = (this.volume / 100);
    }

    onVolumeChanged(e: any)
    {
        this.volume = Number(e.target.value);
        this.setVolume(this.volume);
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

    ngOnInit()
    {
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        this.elementRef.nativeElement.addEventListener('mousemove', this.dragProgress.bind(this));
        this.elementRef.nativeElement.addEventListener('mouseup', this.stopDragging.bind(this));
    }

    ngOnDestroy()
    {
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        this.elementRef.nativeElement.removeEventListener('mousemove', this.dragProgress.bind(this));
        this.elementRef.nativeElement.removeEventListener('mouseup', this.stopDragging.bind(this));
        clearInterval(this._progressInterval);
    }

    handleFullscreenChange()
    {
        this.isFullScreen = !!document.fullscreenElement;
        if (this.isFullScreen)
        {
            this.showControls = false;
        } else
        {
            this.showControls = true;
        }
    }


    updateProgressBar()
    {
        const video: HTMLVideoElement = this.videoPlayer.nativeElement;
        const progressPercent = (video.currentTime / video.duration) * 100;
        this.progress = progressPercent;
        this.currentTime = this.getFormattedTime(Math.round(video.currentTime));
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
